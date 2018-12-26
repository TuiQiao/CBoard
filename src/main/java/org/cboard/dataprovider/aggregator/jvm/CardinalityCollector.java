package org.cboard.dataprovider.aggregator.jvm;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.function.BiConsumer;
import java.util.function.BinaryOperator;
import java.util.function.Function;
import java.util.function.Supplier;
import java.util.stream.Collector;

/**
 * Created by yfyuan on 2017/3/30.
 */
public class CardinalityCollector<T> implements Collector<T, Set<T>, Integer> {

    @Override
    public Supplier<Set<T>> supplier() {
        return () -> {
            Set<T> container = new HashSet<>();
            return container;
        };
    }

    @Override
    public BiConsumer<Set<T>, T> accumulator() {
        return (set, e) -> set.add(e);
    }

    @Override
    public BinaryOperator<Set<T>> combiner() {
        return (a, b) -> {
            a.addAll(b);
            return a;
        };
    }

    @Override
    public Function<Set<T>, Integer> finisher() {
        return (set) -> set.size();
    }

    @Override
    public Set<Characteristics> characteristics() {
        return Collections.emptySet();
    }
}
