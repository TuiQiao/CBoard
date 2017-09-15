package test.org.cboard.dataprovider.aggregator.h2;

import org.junit.Test;
import org.junit.Before;
import org.junit.After;
import org.junit.runner.RunWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.transaction.TransactionConfiguration;
import org.springframework.transaction.annotation.Transactional;

import static com.sun.xml.internal.ws.dump.LoggingDumpTube.Position.After;
import static com.sun.xml.internal.ws.dump.LoggingDumpTube.Position.Before;

/**
 * H2Aggregator Tester.
 *
 * @author <Authors name>
 * @version 1.0
 * @since <pre> 14, 2017</pre>
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration("classpath:spring.xml")
@Transactional
public class H2AggregatorTest {

    @Before
    public void before() throws Exception {
    }

    @After
    public void after() throws Exception {
    }

    /**
     * Method: checkExist()
     */
    @Test
    public void testCheckExist() throws Exception {

    }

    /**
     * Method: loadData(String[][] data, long interval)
     */
    @Test
    public void testLoadData() throws Exception {
    }

    /**
     * Method: cleanExist()
     */
    @Test
    public void testCleanExist() throws Exception {
    }

    /**
     * Method: queryDimVals(String columnName, AggConfig config)
     */
    @Test
    public void testQueryDimVals() throws Exception {
    }

    /**
     * Method: getColumn()
     */
    @Test
    public void testGetColumn() throws Exception {
    }

    /**
     * Method: queryAggData(AggConfig ac)
     */
    @Test
    public void testQueryAggData() throws Exception {
    }


} 
