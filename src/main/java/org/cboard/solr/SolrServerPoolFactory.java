package org.cboard.solr;

import org.apache.commons.pool2.impl.GenericObjectPool;
import org.apache.commons.pool2.impl.GenericObjectPoolConfig;
import org.apache.solr.client.solrj.SolrClient;

import java.io.IOException;

/**
 * Created by JunjieM on 2017-7-7.
 */
public class SolrServerPoolFactory {

    private GenericObjectPool<SolrClient> pool;

    public SolrServerPoolFactory(GenericObjectPoolConfig config, String solrServices, String collectionName) {
        SolrServerFactory factory = new SolrServerFactory(solrServices, collectionName);
        pool = new GenericObjectPool(factory, config);
    }

    public SolrClient getConnection() {
        try {
            return pool.borrowObject();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public void releaseConnection(SolrClient solrClient) {
        try {
            pool.returnObject(solrClient);
        } catch (Exception e) {
            if (solrClient != null) {
                try {
                    solrClient.close();
                } catch (IOException e1) {
                    e1.printStackTrace();
                }
                solrClient = null;
            }
        }
    }

    public void closePool() {
        if (pool != null) {
            try {
                pool.close();
                pool = null;
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
