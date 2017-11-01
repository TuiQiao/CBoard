package org.cboard.services.persist.excel;

import org.apache.poi.ss.usermodel.*;

import java.util.Base64;

/**
 * Created by yfyuan on 2017/2/15.
 */
public class JpgXlsProcesser extends XlsProcesser {
    @Override
    protected ClientAnchor drawContent(XlsProcesserContext context) {
        String pngData = context.getData().getString("data");
        // data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABI4AAAEsCAYAAAClh/jbAAA ...
        String[] arr = pngData.split("base64,");
        byte[] bytes = Base64.getDecoder().decode(arr[1]);
        //byte[] bytes = Base64.getDecoder().decode(pngData.substring(23));
        int pictureIdx = context.getWb().addPicture(bytes, Workbook.PICTURE_TYPE_JPEG);
        Drawing drawing = context.getBoardSheet().createDrawingPatriarch();
        CreationHelper helper = context.getWb().getCreationHelper();
        ClientAnchor anchor = helper.createClientAnchor();
        //HSSFClientAnchor anchor = new HSSFClientAnchor();
        anchor.setCol1(context.getC1());
        anchor.setRow1(context.getR1());
        anchor.setCol2(context.getC2());
        int r2 = context.getR2();
        if ("kpi".equals(context.getData().getString("widgetType"))) {
            r2 = context.getR1() + 8;
        }
        anchor.setRow2(r2);
        Picture picture = drawing.createPicture(anchor, pictureIdx);
        return picture.getClientAnchor();
    }
}
