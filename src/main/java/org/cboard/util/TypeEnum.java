package org.cboard.util;

/**
 * Created by Victor on 18-2-1.
 */
public enum TypeEnum {

    BIT(-7, "BIT"), TINYINT(-6, "TINYINT"), SMALLINT(5, "SMALLINT"), INTEGER(4, "INTEGER"), BIGINT(-5, "BIGINT"), FLOAT(6, "FLOAT"), REAL(7, "REAL"), DOUBLE(8, "DOUBLE"), NUMERIC(2, "NUMERIC"),
    DECIMAL(3, "DECIMAL"), CHAR(1, "CHAR"), VARCHAR(12, "VARCHAR"), LONGVARCHAR(-1, "LONGVARCHAR"), DATE(91, "DATE"), TIME(92, "TIME"), TIMESTAMP(93, "TIMESTAMP"), BINARY(-2, "BINARY"), VARBINARY(-3, "VARBINARY"), LONGVARBINARY(-4, "LONGVARBINARY");

    private Integer index;
    private String name;

    private TypeEnum(Integer index, String name) {
        this.name = name;
        this.index = index;
    }

    public Integer getIndex() {
        return index;
    }

    public void setIndex(Integer index) {
        this.index = index;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
