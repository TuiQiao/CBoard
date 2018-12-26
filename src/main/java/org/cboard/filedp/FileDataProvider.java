package org.cboard.filedp;

import au.com.bytecode.opencsv.CSVReader;
import com.alibaba.fastjson.JSON;
import com.google.common.base.Stopwatch;
import org.apache.commons.lang.StringUtils;
import org.cboard.dataprovider.DataProvider;
import org.cboard.dataprovider.annotation.DatasourceParameter;
import org.cboard.dataprovider.annotation.ProviderName;
import org.cboard.dataprovider.annotation.QueryParameter;
import org.cboard.exception.CBoardException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;

import java.io.*;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.IntStream;

import static java.util.stream.Collectors.toList;

/**
 * Created by zyong on 2017/2/4.
 */
@ProviderName(name = "TextFile")
public class FileDataProvider extends DataProvider {

    private static final Logger LOG = LoggerFactory.getLogger(FileDataProvider.class);

    @Value("${dataprovider.resultLimit:300000}")
    private int resultLimit;

    @DatasourceParameter(label = "{{'DATAPROVIDER.TEXTFILE.BASE_PATH'|translate}}",
            type = DatasourceParameter.Type.Input,
            order = 1)
    private String DS_PARAM_BASE_PATH = "basePath";

    @QueryParameter(label = "{{'DATAPROVIDER.TEXTFILE.FILE_NAME'|translate}}",
            type = QueryParameter.Type.Input,
            order = 1)
    private String QUERY_PARAM_FILE_NAME = "fileName";

    @QueryParameter(label = "{{'DATAPROVIDER.TEXTFILE.ENCODING'|translate}}",
            value = "UTF-8",
            placeholder = "default value is UTF-8",
            type = QueryParameter.Type.Input,
            order = 2)
    private String QUERY_PARAM_ENCODING = "encoding";

    @QueryParameter(label = "{{'DATAPROVIDER.TEXTFILE.DATA_TYPE'|translate}}",
            value = "DSV",
            options = {"DSV", "CSV", "JSON"},
            type = QueryParameter.Type.Select,
            order = 3)
    private String QUERY_PARAM_DATA_TYPE = "dataType";

    @QueryParameter(label = "{{'DATAPROVIDER.TEXTFILE.FIELD_NAMES'|translate}}",
            placeholder = "<fieldName>[,<fieldName>]...(The file has fields header without input)",
            type = QueryParameter.Type.Input,
            order = 4)
    private String QUERY_PARAM_FIELD_NAMES = "fieldNames";

    @QueryParameter(label = "{{'DATAPROVIDER.TEXTFILE.SEPRATOR'|translate}}",
            value = "\\t",
            placeholder = "default value is \\t (The DataType is JSON without input)",
            type = QueryParameter.Type.Input,
            order = 5)
    private String QUERY_PARAM_SEPRATOR = "seprator";

    @QueryParameter(label = "{{'DATAPROVIDER.TEXTFILE.QUOTE_CHAR'|translate}}",
            value = "\\\"",
            placeholder = "default value is guillemets (The DataType is CSV must input)",
            type = QueryParameter.Type.Input,
            order = 6)
    private String QUERY_PARAM_QUOTECHAR = "quoteChar";

    @QueryParameter(label = "{{'DATAPROVIDER.TEXTFILE.ESCAPE_CHAR'|translate}}",
            value = "\\\\",
            placeholder = "default value is \\\\ (The DataType is CSV must input)",
            type = QueryParameter.Type.Input,
            order = 7)
    private String QUERY_PARAM_ESCAPECHAR = "escapeChar";

    @Override
    public boolean doAggregationInDataSource() {
        return false;
    }

    @Override
    public String[][] getData() throws Exception {
        Stopwatch stopwatch = Stopwatch.createStarted();
        String basePath = dataSource.get(DS_PARAM_BASE_PATH);
        String fileName = query.get(QUERY_PARAM_FILE_NAME);
        String encoding = StringUtils.isBlank(query.get(QUERY_PARAM_ENCODING)) ? "UTF-8" : query.get(QUERY_PARAM_ENCODING);
        String dataType = StringUtils.isBlank(query.get(QUERY_PARAM_DATA_TYPE)) ? "DSV" : query.get(QUERY_PARAM_DATA_TYPE);
        String fieldNames = query.get(QUERY_PARAM_FIELD_NAMES);
        String seprator = query.getOrDefault(QUERY_PARAM_SEPRATOR, "\\t");
        String quoteChar = query.getOrDefault(QUERY_PARAM_QUOTECHAR, "\"");
        String escapeChar = query.getOrDefault(QUERY_PARAM_ESCAPECHAR, "\\");

        String fullPath = basePath + fileName;
        LOG.info("INFO: Read file from {}", fullPath);
        BufferedReader reader = null;
        String[][] strings = null;
        try {
            reader = getBufferedReader(fullPath, encoding);
            if ("JSON".equalsIgnoreCase(dataType)) {
                strings = dealJSON(reader);
            } else if ("DSV".equalsIgnoreCase(dataType)) {
                strings = dealDSV(reader, fieldNames, seprator, quoteChar);
            } else if ("CSV".equalsIgnoreCase(dataType)) {
                strings = dealCSV(reader, fieldNames, seprator, quoteChar, escapeChar);
            }
        } finally {
            if (reader != null) {
                reader.close();
            }
        }
        stopwatch.stop();
        LOG.info("getData() using time: {}s", stopwatch.elapsed(TimeUnit.SECONDS));
        return strings;
    }

    public BufferedReader getBufferedReader(String filePath, String encoding) throws Exception {
        BufferedReader reader = null;
        try {
            FileInputStream fis = new FileInputStream(filePath);
            reader = new BufferedReader(new UnicodeReader(fis, encoding));
        } catch (Exception e) {
            LOG.error("ERROR:" + e.getMessage());
            throw new Exception("ERROR:" + e.getMessage(), e);
        }
        return reader;
    }

    private CSVReader newReader(Reader reader, char separator, char quote, char escape) {
        if ('"' == escape) {
            return new CSVReader(reader, separator, quote);
        }
        return new CSVReader(reader, separator, quote, escape);
    }

    public String[][] dealCSV(BufferedReader reader, String filedNames, String seprator, String quoteStr, String escapeStr) {
        char sepratorChar = seprator.charAt(0);
        char quoteChar = quoteStr.charAt(0);
        char escapeChar = escapeStr.charAt(0);
        CSVReader csv = null;
        String tempString = null;
        List<String[]> result = new LinkedList<>();
        int line = 0;
        // add filed header
        if (StringUtils.isNotEmpty(filedNames)) {
            result.add(filedNames.split(","));
        }
        try {
            // Read line by line
            while ((tempString = reader.readLine()) != null) {
                if (StringUtils.isBlank(tempString.trim())) {
                    continue;
                }
                if (line++ > resultLimit) {
                    throw new CBoardException("Cube result count is greater than limit " + resultLimit);
                }
                csv = newReader(new CharArrayReader(tempString.toCharArray()), sepratorChar, quoteChar, escapeChar);
                result.add(csv.readNext());
            }
        } catch (Exception e) {
            LOG.error("ERROR:" + e.getMessage());
            throw new CBoardException("ERROR:" + e.getMessage());
        }
        return result.toArray(new String[][]{});
    }

    public String[][] dealDSV(BufferedReader reader, String filedNames, String seprator, String quoteStr) {
        String tempString = null;
        List<String[]> result = new LinkedList<>();
        int line = 0;
        // add filed header
        if (StringUtils.isNotBlank(filedNames)) {
            result.add(filedNames.split(","));
        }
        int columnSize = 0;
        try {
            // read line
            while ((tempString = reader.readLine()) != null) {
                if (line == 0) {
                    columnSize = tempString.split(seprator, -1).length;
                }
                if (StringUtils.isBlank(tempString.trim())) {
                    continue;
                }
                if (line++ > resultLimit) {
                    throw new CBoardException("Cube result count is greater than limit " + resultLimit);
                }
                List<String> colArr = new ArrayList(Arrays.asList(tempString.split(seprator, -1)));
                if (colArr.size() < columnSize) {
                    IntStream.range(colArr.size(), columnSize).forEach(
                            i -> colArr.add(i, "")
                    );
                }
                List<String> lineList = colArr.stream().map(column ->
                    column.replaceAll(quoteStr, "")
                ).collect(toList());
                result.add(lineList.toArray(new String[lineList.size()]));
            }
        } catch (IOException e) {
            LOG.error("ERROR:" + e.getMessage());
            throw new CBoardException("ERROR:" + e.getMessage());
        }
        return result.toArray(new String[][]{});
    }

    public String[][] dealJSON(BufferedReader reader) {
        String[][] strings = null;
        String tempString = null;
        List<Map> mapList = new ArrayList();
        try {
            int line = 0;
            while ((tempString = reader.readLine()) != null) {
                if (StringUtils.isBlank(tempString.trim())) {
                    continue;
                }
                if (line++ > resultLimit) {
                    throw new CBoardException("Cube result count is greater than limit " + resultLimit);
                }
                Map map = JSON.parseObject(tempString, Map.class);
                mapList.add(map);
            }
        } catch (Exception ex) {
            StringBuffer sb = new StringBuffer();
            while (tempString != null) {
                sb.append(tempString);
                try {
                    tempString = reader.readLine();
                } catch (IOException e) {
                    LOG.error("ERROR:" + e.getMessage());
                    throw new CBoardException("ERROR:" + e.getMessage());
                }
            }
            mapList = JSON.parseArray(sb.toString(), Map.class);
            if (mapList.size() > resultLimit) {
                throw new CBoardException("Cube result count is greater than limit " + resultLimit);
            }
        } finally {
            if (mapList != null && mapList.size() > 0) {
                Set<Map.Entry<String, Object>> entrySet = mapList.get(0).entrySet();
                strings = new String[mapList.size() + 1][entrySet.size()];
                int col = 0;
                for (Map.Entry<String, Object> entry : entrySet) {
                    strings[0][col] = entry.getKey();
                    col++;
                }
                for (int i = 1; i <= mapList.size(); i++) {
                    int j = 0;
                    for (Map.Entry<String, Object> e : entrySet) {
                        strings[i][j] = String.valueOf(mapList.get(i - 1).get(e.getKey()));
                        j++;
                    }
                }
            }
            return strings;
        }
    }
}
