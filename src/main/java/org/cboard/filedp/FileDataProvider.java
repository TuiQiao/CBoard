package org.cboard.filedp;

import au.com.bytecode.opencsv.CSVReader;
import com.alibaba.fastjson.JSON;
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

import static java.util.stream.Collectors.toList;

/**
 * Created by zyong on 2017/2/4.
 */
@ProviderName(name = "TextFile")
public class FileDataProvider extends DataProvider {

    private static final Logger LOG = LoggerFactory.getLogger(FileDataProvider.class);

    @Value("${dataprovider.resultLimit:300000}")
    private int resultLimit;

    @DatasourceParameter(label = "{{'DATAPROVIDER.TEXTFILE.BASE_PATH'|translate}}", type = DatasourceParameter.Type.Input, order = 1)
    private String DS_PARAM_BASE_PATH = "basePath";

    @QueryParameter(label = "{{'DATAPROVIDER.TEXTFILE.FILE_NAME'|translate}}", type = QueryParameter.Type.Input, order = 1)
    private String QUERY_PARAM_FILE_NAME = "fileName";

    @QueryParameter(label = "{{'DATAPROVIDER.TEXTFILE.ENCODING'|translate}}", value="UTF-8", placeholder = "default value is UTF-8", type = QueryParameter.Type.Input, order = 2)
    private String QUERY_PARAM_ENCODING = "encoding";

    @QueryParameter(label = "{{'DATAPROVIDER.TEXTFILE.DATA_TYPE'|translate}}", options = {"DSV", "JSON", "CSV"}, type = QueryParameter.Type.Select, order = 3)
    private String QUERY_PARAM_DATA_TYPE = "dataType";

    @QueryParameter(label = "{{'DATAPROVIDER.TEXTFILE.FIELD_NAMES'|translate}}", placeholder = "<fieldName>[,<fieldName>]...(The file has a field header without input)", type = QueryParameter.Type.Input, order = 4)
    private String QUERY_PARAM_FIELD_NAMES = "fieldName";

    @QueryParameter(label = "{{'DATAPROVIDER.TEXTFILE.SEPRATOR'|translate}}", value="\\\\t", placeholder = "default value is \\t (The DataType is JSON without input)", type = QueryParameter.Type.Input, order = 5)
    private String QUERY_PARAM_SEPRATOR = "seprator";

    @QueryParameter(label = "{{'DATAPROVIDER.TEXTFILE.QUOTECHAR'|translate}}", type = QueryParameter.Type.Input, order = 6)
    private String QUERY_PARAM_QUOTECHAR = "quoteChar";

    @Override
    public boolean doAggregationInDataSource() {
        return false;
    }

    @Override
    public String[][] getData() throws Exception {
        String basePath = dataSource.get(DS_PARAM_BASE_PATH);
        String fileName = query.get(QUERY_PARAM_FILE_NAME);
        String encoding = query.get(QUERY_PARAM_ENCODING);
        String seprator = query.get(QUERY_PARAM_SEPRATOR);
        String dataType =  query.get(QUERY_PARAM_DATA_TYPE);

        encoding = StringUtils.isBlank(encoding) ? "UTF-8" : encoding;
        seprator = StringUtils.isBlank(seprator) || ("\\t".equalsIgnoreCase(seprator)) ? "\t" : seprator;

        String fullPath = basePath + fileName;
        LOG.info("INFO: Read file from {}", fullPath);
        BufferedReader reader = getBufferedReader(fullPath, encoding);

        String[][] strings = null;
        if("JSON".equalsIgnoreCase(dataType)){
            strings = dealJSON(reader);
        }else if("DSV".equalsIgnoreCase(dataType)){
            strings = dealDSV(reader, seprator);
        }else if("CSV".equalsIgnoreCase(dataType)){
            strings = dealCSV(reader, seprator);
        }
        reader.close();
        return strings;
    }

    public BufferedReader getBufferedReader(String filePath, String encoding) throws Exception {
        BufferedReader reader = null;
        try {
            FileInputStream fis = new FileInputStream(filePath);
            InputStreamReader isr = new InputStreamReader(fis, encoding);
            reader = new BufferedReader(isr);
        }catch (Exception e) {
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

    public String[][] dealCSV(BufferedReader reader, String seprators){
        if(query.getOrDefault(QUERY_PARAM_QUOTECHAR, "").toCharArray().length>1 || seprators.toCharArray().length>1){
            throw new CBoardException("quoteChar and seprator must be char when DataType is CSV");
        }
        char quoteChar = query.getOrDefault(QUERY_PARAM_QUOTECHAR, "").charAt(0);
        char seprator = seprators.charAt(0);
        String filedNames = query.get(QUERY_PARAM_FIELD_NAMES);
        CSVReader csv = null;
        String tempString = null;
        List<String[]> result = new LinkedList<>();
        int line = 0;
        //如果有filedNames则加到第一行
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
                csv = newReader(new CharArrayReader(tempString.toCharArray()),seprator, quoteChar, '\\');
                result.add(csv.readNext());
            }
        } catch (Exception e) {
            LOG.error("ERROR:" + e.getMessage());
            throw new CBoardException("ERROR:" + e.getMessage());
        }
        return result.toArray(new String[][]{});
    }

    public String[][] dealDSV(BufferedReader reader, String seprator){
        String quoteChar = query.getOrDefault(QUERY_PARAM_QUOTECHAR, "");
        String filedNames = query.get(QUERY_PARAM_FIELD_NAMES);
        String tempString = null;
        List<String[]> result = new LinkedList<>();
        int line = 0;
        //如果有filedNames则加到第一行
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
                List<String> lineList = Arrays.asList(tempString.split(seprator)).stream().map(column -> {
                    return column.replaceAll(quoteChar, "");
                }).collect(toList());
                result.add(lineList.toArray(new String[lineList.size()]));
            }
        } catch (IOException e) {
            LOG.error("ERROR:" + e.getMessage());
            throw new CBoardException("ERROR:" + e.getMessage());
        }
        return result.toArray(new String[][]{});
    }

    public String[][] dealJSON(BufferedReader reader){
        String[][] strings = null;
        String tempString = null;
        List<Map> mapList = new ArrayList<Map>();
        try {
            int line = 0;
            List<Map> list = new ArrayList<Map>();
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
        }catch (Exception ex){
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
        }finally {
            if(mapList!=null && mapList.size()>0){
                Set<Map.Entry<String, Object>> entrySet = mapList.get(0).entrySet();
                strings = new String[mapList.size()+1][entrySet.size()];
                int col=0;
                for(Map.Entry<String, Object> entry:entrySet){
                    strings[0][col] = entry.getKey();
                    col++;
                }

                for (int i = 1; i <= mapList.size(); i++) {
                    int j = 0;
                    for (Map.Entry<String, Object> e : entrySet) {
                        strings[i][j] = String.valueOf(mapList.get(i-1).get(e.getKey()));
                        j++;
                    }
                }
            }
            return strings;
        }
    }
}
