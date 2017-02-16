package org.cboard.services.persist.excel;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.ClientAnchor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.util.CellRangeAddress;

/**
 * Created by yfyuan on 2017/2/15.
 */
public abstract class XlsProcesser {

    public ClientAnchor draw(XlsProcesserContext context) {
        Row row = context.getBoardSheet().getRow(context.getR1());
        if (row == null) {
            row = context.getBoardSheet().createRow(context.getR1());
        }
        Cell cell = row.createCell(context.getC1());
        cell.setCellValue(context.getWidget().getString("name"));
        cell.setCellStyle(context.getTitleStyle());
        context.getBoardSheet().addMergedRegion(new CellRangeAddress(row.getRowNum(), row.getRowNum(), cell.getColumnIndex(), context.getC2()));
        row = context.getBoardSheet().createRow(context.getR1() + 1);
        row.setHeight((short) 130);
        context.setR1(context.getR1() + 2);
        context.setR2(context.getR2() + 2);
        return drawContent(context);
    }

    protected abstract ClientAnchor drawContent(XlsProcesserContext context);
}
