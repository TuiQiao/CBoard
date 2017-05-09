package org.cboard.elasticsearch.aggregation;

import org.cboard.util.json.JSONBuilder;

import java.util.TimeZone;

import static org.cboard.util.json.JSONBuilder.*;

/**
 * Created by Peter on 2017/5/7.
 */
public class AggregationBuilder {

    public static JSONBuilder termsAggregation(String fieldName, int size) {
        return json("terms",
                json("field", fieldName).put("size", size));
    }

    public static JSONBuilder dateHistAggregation(String fieldName, String interval, int min_doc_count) {
        return json("date_histogram",
                json().put("field", fieldName)
                        .put("format", "yyyy-MM-dd HH:mm:ss")
                        .put("time_zone", TimeZone.getDefault().getID())
                        .put("interval", interval)
                        .put("min_doc_count", min_doc_count)
        );
    }
}
