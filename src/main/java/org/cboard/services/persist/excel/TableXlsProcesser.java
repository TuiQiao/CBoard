package org.cboard.services.persist.excel;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import org.apache.commons.lang.StringUtils;
import org.apache.poi.hssf.usermodel.HSSFCellStyle;
import org.apache.poi.hssf.usermodel.HSSFClientAnchor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;

/**
 * Created by yfyuan on 2017/2/15.
 */
public class TableXlsProcesser extends XlsProcesser {

    @Override
    protected ClientAnchor drawContent(XlsProcesserContext context) {
        JSONArray tData = context.getData().getJSONArray("data");
        final ClientAnchor tAnchor = new HSSFClientAnchor();
        tAnchor.setCol1(context.getC1());
        tAnchor.setRow1(context.getR1());
        int colSpan = (context.getC2() - context.getC1()) / tData.getJSONArray(0).size();
        int delta = (context.getC2() - context.getC1()) % tData.getJSONArray(0).size();
        for (int r = 0; r < tData.size(); r++) {
            Row row = context.getBoardSheet().getRow(context.getR1() + r);
            if (row == null) {
                row = context.getBoardSheet().createRow(context.getR1() + r);
            }
            int colStart = context.getC1();
            for (int c = 0; c < tData.getJSONArray(r).size(); c++) {
                JSONObject cData = tData.getJSONArray(r).getJSONObject(c);
                int deltaSpan = colSpan;
                if (c <= delta) {
                    deltaSpan = colSpan + 1;
                }
                for (int j = colStart; j < colStart + deltaSpan; j++) {
                    Cell cell = row.createCell(j);
                    String property = cData.getString("property");
                    if ("header_key".equals(property) || "header_empty".equals(property)) {
                        cell.setCellStyle(context.getTableStyle());
                    } else if ("data".equals(property)) {
                        cell.setCellStyle(context.gettStyle());
                    }
                    if (j == colStart) {
                        if ("data".equals(property)) {
                            if (cData.getString("data").contains("%")) {
                                cell.setCellValue(cData.getDoubleValue("raw"));
                                cell.setCellStyle(context.getPercentStyle());
                            } else {
                                cell.setCellValue(cData.getDoubleValue("raw"));
                            }
                        } else {
                            cell.setCellValue(cData.getString("data"));
                        }
                    }
                }
                if (deltaSpan - 1 != 0) {
                    context.getBoardSheet().addMergedRegion(new CellRangeAddress(row.getRowNum(), row.getRowNum(), colStart, colStart + deltaSpan - 1));
                }
                colStart = colStart + deltaSpan;

                tAnchor.setCol2(context.getC2());
                tAnchor.setRow2(row.getRowNum());
            }
        }
        return tAnchor;
    }
}
