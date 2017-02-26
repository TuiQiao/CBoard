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
        byte[] bytes = Base64.getDecoder().decode(pngData.substring(23));
        int pictureIdx = context.getWb().addPicture(bytes, Workbook.PICTURE_TYPE_JPEG);
        Drawing drawing = context.getBoardSheet().createDrawingPatriarch();
        CreationHelper helper = context.getWb().getCreationHelper();
        ClientAnchor anchor = helper.createClientAnchor();
        anchor.setCol1(context.getC1());
        anchor.setRow1(context.getR1());
        Picture picture = drawing.createPicture(anchor, pictureIdx);
        picture.resize();
        return picture.getClientAnchor();
    }
}
