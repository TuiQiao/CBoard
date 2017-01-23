package org.cboard.dataprovider.aggregator.jvm;

import com.google.common.collect.Ordering;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.math.NumberUtils;
import org.cboard.dataprovider.config.AggConfig;
import org.cboard.dataprovider.config.DimensionConfig;

import java.util.*;

/**
 * Created by yfyuan on 2017/1/17.
 */
public class Filter {

    private List<DimensionConfig> ruleList;
    private Map<String, Integer> columnIndex;

    public Filter(AggConfig config, Map<String, Integer> columnIndex) {
        ruleList = new ArrayList<>();
        if (config != null) {
            ruleList.addAll(config.getColumns());
            ruleList.addAll(config.getRows());
            ruleList.addAll(config.getFilters());
        }
        this.columnIndex = columnIndex;
    }

    public boolean filter(String[] row) {
        boolean result = ruleList.stream().allMatch(rule -> {
            if (rule.getValues().size() == 0) {
                return true;
            }
            String v = row[columnIndex.get(rule.getColumnName())];
            if (StringUtils.isEmpty(v)) {
                return false;
            }
            String a = rule.getValues().get(0);
            String b = rule.getValues().size() >= 2 ? rule.getValues().get(1) : null;
            Comparable[] params = null;
            switch (rule.getFilterType()) {
                case "=":
                case "eq":
                    return rule.getValues().stream().anyMatch(e -> e.equals(v));
                case "≠":
                case "ne":
                    return rule.getValues().stream().allMatch(e -> !e.equals(v));
                case ">":
                    params = tryToNumber(v, a);
                    return Ordering.natural().compare(params[0], params[1]) > 0;
                case "<":
                    params = tryToNumber(v, a);
                    return Ordering.natural().compare(params[0], params[1]) < 0;
                case "≥":
                    params = tryToNumber(v, a);
                    return Ordering.natural().compare(params[0], params[1]) >= 0;
                case "≤":
                    params = tryToNumber(v, a);
                    return Ordering.natural().compare(params[0], params[1]) <= 0;
                case "(a,b]":
                    params = tryToNumber(v, a, b);
                    return (rule.getValues().size() >= 2) &&
                            (Ordering.natural().compare(params[0], params[1]) > 0) &&
                            (Ordering.natural().compare(params[0], params[2]) <= 0);
                case "[a,b)":
                    params = tryToNumber(v, a, b);
                    return (rule.getValues().size() >= 2) &&
                            (Ordering.natural().compare(params[0], params[1]) >= 0) &&
                            (Ordering.natural().compare(params[0], params[2]) < 0);
                case "(a,b)":
                    params = tryToNumber(v, a, b);
                    return (rule.getValues().size() >= 2) &&
                            (Ordering.natural().compare(params[0], params[1]) > 0) &&
                            (Ordering.natural().compare(params[0], params[2]) < 0);
                case "[a,b]":
                    params = tryToNumber(v, a, b);
                    return (rule.getValues().size() >= 2) &&
                            (Ordering.natural().compare(params[0], params[1]) >= 0) &&
                            (Ordering.natural().compare(params[0], params[2]) <= 0);
            }
            return true;
        });
        return result;
    }

    private Comparable[] tryToNumber(String... args) {
        boolean allNumber = Arrays.stream(args).allMatch(e -> NumberUtils.isNumber(e));
        if (allNumber) {
            return Arrays.stream(args).mapToDouble(Double::parseDouble).boxed().toArray(Double[]::new);
        } else {
            return args;
        }
    }

}
