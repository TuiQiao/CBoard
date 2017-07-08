package org.cboard.solr;

import org.apache.commons.pool2.impl.GenericObjectPool;
import org.apache.commons.pool2.impl.GenericObjectPoolConfig;
import org.apache.solr.client.solrj.SolrServer;

/**
 * Created by JunjieM on 2017-7-7.
 */
public class SolrServerPoolFactory {

    private GenericObjectPool<SolrServer> pool;

    public SolrServerPoolFactory(GenericObjectPoolConfig config, String solrServices, String collectionName) {
        SolrServerFactory factory = new SolrServerFactory(solrServices, collectionName);
        pool = new GenericObjectPool(factory, config);
    }

    public SolrServer getConnection() {
        try {
            return pool.borrowObject();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public void releaseConnection(SolrServer solrServer) {
        try {
            pool.returnObject(solrServer);
        } catch (Exception e) {
            if (solrServer != null) {
                solrServer.shutdown();
                solrServer = null;
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
