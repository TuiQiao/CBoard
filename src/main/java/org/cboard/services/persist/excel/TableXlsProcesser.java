package org.cboard.services.persist.excel;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import org.apache.poi.hssf.usermodel.HSSFClientAnchor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.ss.util.CellRangeUtil;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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
        int rowHeader = 0;
        List<Integer> columnHeaderCellIdx = new ArrayList<>();
        List<Integer> columnDataCellIdx = new ArrayList<>();
        List<CellRangeAddress> mergeRegion = new ArrayList<>();
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
                String property = cData.getString("property");

                if (c == tData.getJSONArray(r).size() - 1) {
                    if (!"data".equals(property)) {
                        rowHeader = r;
                    }
                }
                if (r == tData.size() - 1) {
                    if (!"data".equals(property)) {
                        columnHeaderCellIdx.add(colStart);
                    } else {
                        columnDataCellIdx.add(colStart);
                    }
                }

                for (int j = colStart; j < colStart + deltaSpan; j++) {
                    Cell cell = row.createCell(j);
                    if ("header_key".equals(property) || "header_empty".equals(property)) {
                        cell.setCellStyle(context.getTableStyle());
                    } else if ("data".equals(property)|| "column_key".equals(property)) {
                        cell.setCellStyle(context.gettStyle());
                    }
                    if (j == colStart) {
                        if ("data".equals(property)) {
                            if (cData.getString("data") != null && cData.getString("data").contains("%")) {
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
                mergeRegion.add(new CellRangeAddress(row.getRowNum(), row.getRowNum(), colStart, colStart + deltaSpan - 1));
//                if (deltaSpan - 1 != 0) {
//                    context.getBoardSheet().addMergedRegion(new CellRangeAddress(row.getRowNum(), row.getRowNum(), colStart, colStart + deltaSpan - 1));
//                }
                colStart = colStart + deltaSpan;

                tAnchor.setCol2(context.getC2());
                tAnchor.setRow2(row.getRowNum());
            }
        }

        String mergeKey = null;
        List<CellHelper> mergedList = new ArrayList<>();
        for (int col = columnHeaderCellIdx.size() - 1; col >= 0; col--) {
            for (int r = context.getR1(); r <= tAnchor.getRow2(); r++) {
                HCell hCell = new HCell(context, mergeRegion, context.getBoardSheet().getRow(r).getCell(columnHeaderCellIdx.get(col)));
                if (mergeKey != null) {
                    if (mergeKey.equals(hCell.getMergeKey())) {
                        mergedList.add(hCell);
                    } else {
                        mergeCellHelper(mergeRegion, mergedList);
                        mergedList = new ArrayList<>();
                        mergeKey = hCell.getMergeKey();
                        mergedList.add(hCell);
                    }
                } else {
                    mergeKey = hCell.getMergeKey();
                }
            }
        }
        mergeCellHelper(mergeRegion, mergedList);
        mergeKey = null;
        mergedList = new ArrayList<>();
        for (int row = rowHeader; row >= 0; row--) {
            for (int c = 0; c < columnDataCellIdx.size(); c++) {
                VCell vCell = new VCell(context, mergeRegion, context.getBoardSheet().getRow(context.getR1() + row).getCell(columnDataCellIdx.get(c)));
                if (mergeKey != null) {
                    if (mergeKey.equals(vCell.getMergeKey())) {
                        mergedList.add(vCell);
                    } else {
                        mergeCellHelper(mergeRegion, mergedList);
                        mergedList = new ArrayList<>();
                        mergeKey = vCell.getMergeKey();
                        mergedList.add(vCell);
                    }
                } else {
                    mergeKey = vCell.getMergeKey();
                }
            }
        }
        mergeCellHelper(mergeRegion, mergedList);
        mergeRegion.stream().filter(e -> e.getFirstColumn() != e.getLastColumn() || e.getFirstRow() != e.getLastRow()).forEach(e -> context.getBoardSheet().addMergedRegion(e));
        return tAnchor;
    }

    private void mergeCellHelper(List<CellRangeAddress> mergeRegion, List<CellHelper> mergeList) {
        if (mergeList.size() < 2) {
            return;
        }
        for (CellHelper cellHelper : mergeList) {
            mergeRegion.remove(cellHelper.getMergedCell());
        }
        CellRangeAddress[] toMerged = mergeList.stream().map(e -> e.getMergedCell()).collect(Collectors.toList()).toArray(new CellRangeAddress[0]);
        CellRangeAddress[] merged = CellRangeUtil.mergeCellRanges(toMerged);
        Arrays.stream(merged).forEach(e -> mergeRegion.add(e));
    }

    private abstract class CellHelper {
        private Cell cell;
        private CellRangeAddress mergedCell;
        private String mergeKey;

        public CellHelper(XlsProcesserContext context, List<CellRangeAddress> mergeRegion, Cell cell) {
            Optional<CellRangeAddress> r = mergeRegion.stream().filter(c -> c.isInRange(cell.getRowIndex(), cell.getColumnIndex())).findFirst();
            CellRangeAddress _c = r.get();
            this.cell = cell;
            this.mergedCell = _c;

            parseMergeKey(context, cell);
        }

        protected abstract void parseMergeKey(XlsProcesserContext context, Cell cell);

        public String getMergeKey() {
            return mergeKey;
        }

        public Cell getCell() {
            return cell;
        }

        public void setCell(Cell cell) {
            this.cell = cell;
        }

        public CellRangeAddress getMergedCell() {
            return mergedCell;
        }
    }

    private class HCell extends CellHelper {

        public HCell(XlsProcesserContext context, List<CellRangeAddress> mergeRegion, Cell cell) {
            super(context, mergeRegion, cell);
        }

        @Override
        protected void parseMergeKey(XlsProcesserContext context, Cell cell) {
            StringBuilder sb = new StringBuilder();
            for (int c = cell.getColumnIndex(); c >= context.getC1(); c--) {
                Cell _cell = context.getBoardSheet().getRow(cell.getRowIndex()).getCell(c);
                if (_cell != null && _cell.getStringCellValue() != null) {
                    sb.append(_cell.getStringCellValue());
                }
            }
            super.mergeKey = sb.toString();
        }

    }

    private class VCell extends CellHelper {

        public VCell(XlsProcesserContext context, List<CellRangeAddress> mergeRegion, Cell cell) {
            super(context, mergeRegion, cell);
        }

        @Override
        protected void parseMergeKey(XlsProcesserContext context, Cell cell) {
            StringBuilder sb = new StringBuilder();
            for (int r = cell.getRowIndex(); r >= context.getR1(); r--) {
                Cell _cell = context.getBoardSheet().getRow(r).getCell(cell.getColumnIndex());
                if (_cell != null && _cell.getStringCellValue() != null) {
                    sb.append(_cell.getStringCellValue());
                }
            }
            super.mergeKey = sb.toString();
        }

    }

}
