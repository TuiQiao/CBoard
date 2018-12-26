package org.cboard.dataprovider.aggregator.jvm;

import org.cboard.dataprovider.result.ColumnIndex;

import java.util.*;
import java.util.function.BiConsumer;
import java.util.function.BinaryOperator;
import java.util.function.Function;
import java.util.function.Supplier;
import java.util.stream.Collector;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

/**
 * Created by yfyuan on 2017/1/20.
 */
public class AggregateCollector<T> implements Collector<T[], Object[], Double[]> {
    private List<ColumnIndex> valueList;
    private List<Collector> collectors;

    public static <T> AggregateCollector<T> getCollector(List<ColumnIndex> valueList) {
        return new AggregateCollector(valueList);
    }

    private AggregateCollector(List<ColumnIndex> valueList) {
        this.valueList = valueList;
        this.collectors = new ArrayList<>(valueList.size());
        valueList.stream().forEach(e -> collectors.add(null));
        IntStream.range(0, valueList.size()).forEach(i -> collectors.set(i, newCollector(valueList.get(i))));
    }

    private double toDouble(Object o) {
        if (o instanceof Double) {
            return ((Double) o).doubleValue();
        } else {
            double result = 0;
            try {
                result = Double.parseDouble((String) o);
            } catch (Exception e) {
            }
            return result;
        }
    }

    private Collector newCollector(ColumnIndex columnIndex) {
        switch (columnIndex.getAggType()) {
            case "sum":
                return Collectors.summingDouble(this::toDouble);
            case "avg":
                return Collectors.averagingDouble(this::toDouble);
            case "max":
                return Collectors.maxBy(Comparator.comparingDouble(this::toDouble));
            case "min":
                return Collectors.minBy(Comparator.comparingDouble(this::toDouble));
            case "distinct":
                return new CardinalityCollector();
            default:
                return Collectors.counting();
        }
    }

    @Override
    public Supplier<Object[]> supplier() {
        //new value row array
        return () -> {
            Object[] container = new Object[valueList.size()];
            IntStream.range(0, valueList.size()).forEach(i -> container[i] = collectors.get(i).supplier().get());
            return container;
        };
    }

    @Override
    public BiConsumer<Object[], T[]> accumulator() {
        return (array, e) ->
                IntStream.range(0, array.length).forEach(i -> {
                    collectors.get(i).accumulator().accept(array[i], e[valueList.get(i).getIndex()]);
                });

    }

    @Override
    public BinaryOperator<Object[]> combiner() {
        return (a, b) -> {
            IntStream.range(0, a.length).forEach(i -> a[i] = collectors.get(i).combiner().apply(a[i], b[i]));
            return a;
        };
    }

    @Override
    public Function<Object[], Double[]> finisher() {
        return (array) -> {
            Double[] result = new Double[array.length]; //TODO new?
            IntStream.range(0, array.length).forEach(i -> {
                Object r = collectors.get(i).finisher().apply(array[i]);
                if (r instanceof Double) {
                    result[i] = (Double) r;
                } else if (r instanceof Long) {
                    result[i] = ((Long) r).doubleValue();
                } else if (r instanceof Integer) {
                    result[i] = ((Integer) r).doubleValue();
                } else if (r instanceof Optional) {
                    result[i] = toDouble(((Optional) r).get());
                }

            });
            return result;
        }

                ;
    }

    @Override
    public Set<Characteristics> characteristics() {
        return Collections.emptySet();
    }
}
