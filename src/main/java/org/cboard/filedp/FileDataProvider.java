package org.cboard.filedp;

import org.cboard.dataprovider.DataProvider;
import org.cboard.dataprovider.annotation.DatasourceParameter;
import org.cboard.dataprovider.annotation.ProviderName;
import org.cboard.dataprovider.annotation.QueryParameter;
import org.cboard.exception.CBoardException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Value;

import java.io.*;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import static java.util.stream.Collectors.*;

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
    @QueryParameter(label = "{{'DATAPROVIDER.TEXTFILE.ENCODING'|translate}}", type = QueryParameter.Type.Input, order = 2)
    private String QUERY_PARAM_ENCODING = "encoding";
    @QueryParameter(label = "{{'DATAPROVIDER.TEXTFILE.SEPRATOR'|translate}}", type = QueryParameter.Type.Input, order = 3)
    private String QUERY_PARAM_SEPRATOR = "seprator";
    @QueryParameter(label = "{{'DATAPROVIDER.TEXTFILE.ENCLOSURE'|translate}}", type = QueryParameter.Type.Input, order = 4)
    private String QUERY_PARAM_ENCLOSURE = "enclosure";

    @Override
    public String[][] getData() throws Exception {
        String basePath = dataSource.get(DS_PARAM_BASE_PATH);
        String fileName = query.get(QUERY_PARAM_FILE_NAME);
        String encoding = query.get(QUERY_PARAM_ENCODING);
        String seprator = query.get(QUERY_PARAM_SEPRATOR);
        String enclosure = query.getOrDefault(QUERY_PARAM_ENCLOSURE, "");

        encoding = StringUtils.isBlank(encoding) ? "UTF-8" : encoding;
        seprator = StringUtils.isBlank(seprator) ? "\t" : seprator;

        String fullPath = basePath + fileName;
        LOG.info("INFO: Read file from {}", fullPath);
        File file = new File(fullPath);
        List<String[]> result = null;
        try (
                FileInputStream fis = new FileInputStream(file);
                InputStreamReader isr = new InputStreamReader(fis, encoding);
                BufferedReader reader = new BufferedReader(isr)
        ) {
            String tempString = null;
            result = new LinkedList<>();
            int line = 0;
            // Read line by line
            while ((tempString = reader.readLine()) != null) {
                if (StringUtils.isBlank(tempString.trim())) {
                    continue;
                }

                if (line++ > resultLimit) {
                    throw new CBoardException("Cube result count is greater than limit " + resultLimit);
                }

                List<String> lineList = Arrays.asList(tempString.split(seprator)).stream().map(column -> {
                    return column.replaceAll(enclosure, "");
                }).collect(toList());
                result.add(lineList.toArray(new String[lineList.size()]));
            }
            reader.close();
        } catch (Exception e) {
            LOG.error("ERROR:" + e.getMessage());
            throw new Exception("ERROR:" + e.getMessage(), e);
        }

        return result.toArray(new String[][]{});
    }
}
