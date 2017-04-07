package org.cboard.dataprovider.aggregator.jvm;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.function.*;
import java.util.stream.Collector;

/**
 * Created by yfyuan on 2017/3/30.
 */
public class CardinalityCollector<T> implements Collector<T, List<T>, Integer> {

    @Override
    public Supplier<List<T>> supplier() {
        return () -> {
            List<T> container = new ArrayList<>();
            return container;
        };
    }

    @Override
    public BiConsumer<List<T>, T> accumulator() {
        return (array, e) -> {
            if (!array.contains(e)) {
                array.add(e);
            }
        };
    }

    @Override
    public BinaryOperator<List<T>> combiner() {
        return (a, b) -> {
            b.stream().filter(e -> !a.contains(e)).forEach(a::add);
            return a;
        };
    }

    @Override
    public Function<List<T>, Integer> finisher() {
        return (array) -> array.size();
    }

    @Override
    public Set<Characteristics> characteristics() {
        return Collections.emptySet();
    }
}
