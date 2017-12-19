package org.cboard.services.persist.excel;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import org.apache.poi.hssf.usermodel.HSSFPalette;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.*;
import org.cboard.dao.BoardDao;
import org.cboard.pojo.DashboardBoard;
import org.cboard.services.persist.PersistContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Iterator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

/**
 * Created by yfyuan on 2017/2/15.
 */
@Service
public class XlsProcessService {

    @Autowired
    private BoardDao boardDao;

    private XlsProcesser jpgXlsProcesser = new JpgXlsProcesser();
    private XlsProcesser tableXlsProcesser = new TableXlsProcesser();

    public HSSFWorkbook dashboardToXls(List<PersistContext> contexts) {
        XlsProcesserContext context = null;
        for (PersistContext e : contexts) {
            context = dashboardToXls(e, context);
        }
        return (HSSFWorkbook) context.getWb();
    }

    public HSSFWorkbook tableToxls(JSONObject data) {
        XlsProcesserContext context = new XlsProcesserContext();
        HSSFWorkbook wb = new HSSFWorkbook();
        setColorIndex(wb);
        CellStyle titleStyle = createTitleStyle(wb);
        CellStyle thStyle = createThStyle(wb);
        CellStyle tStyle = createTStyle(wb);
        CellStyle percentStyle = wb.createCellStyle();
        percentStyle.cloneStyleFrom(tStyle);
        percentStyle.setDataFormat((short) 0xa);
        context.setWb(wb);
        context.setTableStyle(thStyle);
        context.setTitleStyle(titleStyle);
        context.settStyle(tStyle);
        context.setPercentStyle(percentStyle);
        Sheet sheet = context.getWb().createSheet();
        context.setBoardSheet(sheet);
        context.setC1(0);
        context.setC2(data.getJSONArray("data").getJSONArray(0).size() - 1);
        context.setR1(0);
        context.setR2(0);
        context.setData(data);
        new TableXlsProcesser().drawContent(context);
        setAutoWidth(sheet);
        return wb;
    }

    private XlsProcesserContext dashboardToXls(PersistContext persistContext, XlsProcesserContext context) {
        DashboardBoard board = boardDao.getBoard(persistContext.getDashboardId());
        JSONArray rows = JSONObject.parseObject(board.getLayout()).getJSONArray("rows");
        List<JSONArray> widgetRows = rows.stream().map(row -> (JSONObject) row)
                .filter(row -> row.getString("type") == null || "widget".equals(row.getString("type")))
                .map(row -> {
                    JSONArray widgets = row.getJSONArray("widgets");
                    widgets.forEach(a -> ((JSONObject) a).put("height", row.get("height")));
                    return widgets;
                })
                .collect(Collectors.toList());

        int widgets = 0;
        int tables = 0;
        for (JSONArray rw : widgetRows) {
            for (int i = 0; i < rw.size(); i++) {
                JSONObject widget = rw.getJSONObject(i);
                JSONObject v = persistContext.getData().getJSONObject(widget.getLong("widgetId").toString());
                if (v != null && "table".equals(v.getString("type"))) {
                    tables++;
                }
                widgets++;
            }
        }

        int columns = 170;
        int columnWidth = 1700 / columns;
        int column_width12 = 148;

        if (context == null) {
            context = new XlsProcesserContext();
            HSSFWorkbook wb = new HSSFWorkbook();
            setColorIndex(wb);
            CellStyle titleStyle = createTitleStyle(wb);
            CellStyle thStyle = createThStyle(wb);
            CellStyle tStyle = createTStyle(wb);
            CellStyle percentStyle = wb.createCellStyle();
            percentStyle.cloneStyleFrom(tStyle);
            percentStyle.setDataFormat((short) 0xa);
            context.setWb(wb);
            context.setTableStyle(thStyle);
            context.setTitleStyle(titleStyle);
            context.settStyle(tStyle);
            context.setPercentStyle(percentStyle);
        }
        int eachRow = -2;
        int dCol;
        int dRow;
        int widthInRow;

        if (tables != widgets) {
            Sheet sheet = context.getWb().createSheet(board.getName());
            sheet.setDisplayGridlines(false);
            IntStream.range(0, 180).forEach(i -> sheet.setColumnWidth(i, 365));
            context.setBoardSheet(sheet);
            for (JSONArray rw : widgetRows) {
                dCol = Math.round(30.0f / 1700 * columns);
                dRow = eachRow + 3;
                widthInRow = 0;
                for (int i = 0; i < rw.size(); i++) {

                    JSONObject widget = rw.getJSONObject(i);
                    JSONObject v = persistContext.getData().getJSONObject(widget.getLong("widgetId").toString());
                    if (v == null || v.keySet().size() == 0) {
                        continue;
                    }
                    int width = widget.getInteger("width").intValue();
                    int widget_cols = Math.round(1.0f * width / 12 * (148 - (rw.size() - 1) * 2));
                    widthInRow += width;
                    if (widthInRow > 12) {
                        dCol = Math.round(30.0f / 1700 * columns);
                        dRow = eachRow + 3;
                        widthInRow = width;
                    }
                    context.setC1(dCol + 2);
                    context.setC2(dCol + 2 + widget_cols);
                    context.setR1(dRow);
                    context.setR2(dRow);
                    context.setWidget(widget);
                    context.setData(v);
                    XlsProcesser processer = getProcesser(v.getString("type"));
                    ClientAnchor anchor = processer.draw(context);
                    if (anchor.getRow2() > eachRow) {
                        eachRow = anchor.getRow2();
                    }
                    dCol = context.getC2();
                }
            }
        }
        if (tables == 0) {
            return context;
        }
        dRow = 0;
        Sheet dataSheet = context.getWb().createSheet(board.getName() + "_table");
        context.setBoardSheet(dataSheet);
        for (JSONArray rw : widgetRows) {
            for (int i = 0; i < rw.size(); i++) {
                JSONObject widget = rw.getJSONObject(i);
                JSONObject v = persistContext.getData().getJSONObject(widget.getLong("widgetId").toString());
                if (v == null || !"table".equals(v.getString("type"))) {
                    continue;
                }
                context.setC1(0);
                int c2 = v.getJSONArray("data").getJSONArray(0).size() - 1;
                context.setC2(c2 == 0 ? 1 : c2);
                context.setR1(dRow);
                context.setR2(dRow);
                context.setWidget(widget);
                context.setData(v);
                XlsProcesser processer = getProcesser(v.getString("type"));
                ClientAnchor anchor = processer.draw(context);
                dRow = anchor.getRow2() + 2;
            }
        }
        setAutoWidth(dataSheet);

        return context;
    }

    private void setAutoWidth(Sheet dataSheet) {
        int max = 0;
        Iterator<Row> i = dataSheet.rowIterator();
        while (i.hasNext()) {
            Row r = i.next();
            if (r.getLastCellNum() > max) {
                max = r.getLastCellNum();
            }
        }
        for (int colNum = 0; colNum < max; colNum++) {
            dataSheet.autoSizeColumn(colNum, true);
        }
    }

    private XlsProcesser getProcesser(String type) {
        switch (type) {
            case "jpg":
                return jpgXlsProcesser;
            case "table":
                return tableXlsProcesser;
        }
        return null;
    }

    private CellStyle createTitleStyle(HSSFWorkbook wb) {
        Font font = wb.createFont();
        font.setFontHeightInPoints((short) 16);
        font.setColor(IndexedColors.WHITE.getIndex());
        font.setFontName("微软雅黑");
        CellStyle titleStyle = wb.createCellStyle();
        titleStyle.setFillForegroundColor(IndexedColors.BLUE.getIndex());
        titleStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        titleStyle.setFont(font);
        titleStyle.setAlignment(HorizontalAlignment.CENTER);
        titleStyle.setVerticalAlignment(VerticalAlignment.CENTER);
        return titleStyle;
    }

    private CellStyle createThStyle(HSSFWorkbook wb) {
        CellStyle thStyle = wb.createCellStyle();
        thStyle.setFillForegroundColor(IndexedColors.BLUE.getIndex());
        thStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        thStyle.setBorderBottom(BorderStyle.THIN);
        thStyle.setBottomBorderColor(IndexedColors.BLUE_GREY.getIndex());
        thStyle.setBorderLeft(BorderStyle.THIN);
        thStyle.setLeftBorderColor(IndexedColors.BLUE_GREY.getIndex());
        thStyle.setBorderRight(BorderStyle.THIN);
        thStyle.setRightBorderColor(IndexedColors.BLUE_GREY.getIndex());
        thStyle.setBorderTop(BorderStyle.THIN);
        thStyle.setTopBorderColor(IndexedColors.BLUE_GREY.getIndex());
        thStyle.setAlignment(HorizontalAlignment.CENTER);
        thStyle.setVerticalAlignment(VerticalAlignment.CENTER);
        thStyle.setShrinkToFit(true);
        Font font = wb.createFont();
        font.setColor(IndexedColors.WHITE.getIndex());
        thStyle.setFont(font);
        return thStyle;
    }

    private CellStyle createTStyle(HSSFWorkbook wb) {
        CellStyle tStyle = wb.createCellStyle();
        tStyle.setBorderBottom(BorderStyle.THIN);
        tStyle.setBottomBorderColor(IndexedColors.GREY_25_PERCENT.getIndex());
        tStyle.setBorderLeft(BorderStyle.THIN);
        tStyle.setLeftBorderColor(IndexedColors.GREY_25_PERCENT.getIndex());
        tStyle.setBorderRight(BorderStyle.THIN);
        tStyle.setRightBorderColor(IndexedColors.GREY_25_PERCENT.getIndex());
        tStyle.setBorderTop(BorderStyle.THIN);
        tStyle.setTopBorderColor(IndexedColors.GREY_25_PERCENT.getIndex());
        tStyle.setAlignment(HorizontalAlignment.CENTER);
        tStyle.setVerticalAlignment(VerticalAlignment.CENTER);
        tStyle.setShrinkToFit(true);
        return tStyle;
    }

    private void setColorIndex(HSSFWorkbook wb) {
        HSSFPalette customPalette = wb.getCustomPalette();
        customPalette.setColorAtIndex(IndexedColors.BLUE.index, (byte) 26, (byte) 127, (byte) 205);
        customPalette.setColorAtIndex(IndexedColors.BLUE_GREY.index, (byte) 56, (byte) 119, (byte) 166);
        customPalette.setColorAtIndex(IndexedColors.GREY_25_PERCENT.index, (byte) 235, (byte) 235, (byte) 235);
    }

}
