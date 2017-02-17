package org.cboard.services.persist.excel;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import org.apache.poi.hssf.usermodel.HSSFPalette;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.*;
import org.cboard.dao.BoardDao;
import org.cboard.pojo.DashboardBoard;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.FileOutputStream;
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

    public void dashboardToXls(Long dashboardId, JSONObject data) {
        DashboardBoard board = boardDao.getBoard(dashboardId);
        JSONArray rows = JSONObject.parseObject(board.getLayout()).getJSONArray("rows");
        List<JSONArray> arr = rows.stream().map(e -> (JSONObject) e).filter(e -> "widget".equals(e.getString("type"))).map(e -> e.getJSONArray("widgets")).collect(Collectors.toList());

        int columns = 170;
        int columnWidth = 1700 / columns;
        int column_width12 = 148;

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

        Sheet sheet = wb.createSheet(board.getName());
        sheet.setDisplayGridlines(false);
        IntStream.range(0, 180).forEach(i -> sheet.setColumnWidth(i, 365));
        context.setBoardSheet(sheet);
        int eachRow = 0;
        for (JSONArray rw : arr) {
            int dCol = Math.round(30.0f / 1700 * columns);
            int dRow = eachRow + 3;
            for (int i = 0; i < rw.size(); i++) {
                JSONObject widget = rw.getJSONObject(i);
                JSONObject v = data.getJSONObject(widget.getLong("widgetId").toString());
                int widget_cols = Math.round(1.0f * widget.getInteger("width").intValue() / 12 * (148 - (rw.size() - 1) * 2));
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
        eachRow = 0;
        Sheet dataSheet = wb.createSheet(board.getName() + "_table");
        context.setBoardSheet(dataSheet);
        for (JSONArray rw : arr) {
            int dCol = 0;
            int dRow = eachRow + 2;
            eachRow = 0;
            for (int i = 0; i < rw.size(); i++) {
                JSONObject widget = rw.getJSONObject(i);
                JSONObject v = data.getJSONObject(widget.getLong("widgetId").toString());
                if (!"table".equals(v.getString("type"))) {
                    continue;
                }
                context.setC1(dCol + 2);
                context.setC2(dCol + 2 + v.getJSONArray("data").getJSONArray(0).size());
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

        try (FileOutputStream fileOut = new FileOutputStream(board.getName() + ".xls")) {
            wb.write(fileOut);
        } catch (Exception e) {
            e.printStackTrace();
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
        return tStyle;
    }

    private void setColorIndex(HSSFWorkbook wb) {
        HSSFPalette customPalette = wb.getCustomPalette();
        customPalette.setColorAtIndex(IndexedColors.BLUE.index, (byte) 26, (byte) 127, (byte) 205);
        customPalette.setColorAtIndex(IndexedColors.BLUE_GREY.index, (byte) 56, (byte) 119, (byte) 166);
        customPalette.setColorAtIndex(IndexedColors.GREY_25_PERCENT.index, (byte) 235, (byte) 235, (byte) 235);
    }

}
