package org.cboard.solr;

import org.apache.commons.pool2.PooledObject;
import org.apache.commons.pool2.PooledObjectFactory;
import org.apache.commons.pool2.impl.DefaultPooledObject;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrServer;
import org.apache.solr.client.solrj.impl.LBHttpSolrServer;

/**
 * Created by JunjieM on 2017-7-7.
 */
public class SolrServerFactory implements PooledObjectFactory<SolrServer> {

    private String[] servers;

    public SolrServerFactory(String solrServices, String collectionName) {
        String[] tempServers = solrServices.split(",");
        servers = new String[tempServers.length];
        for (int i = 0; i < tempServers.length; i++) {
            servers[i] = "http://" + tempServers[i] + "/solr/" + collectionName;
        }
    }

    public PooledObject<SolrServer> makeObject() throws Exception {
        SolrClient solrServer = new LBHttpSolrServer(servers);
        return new DefaultPooledObject(solrServer);
    }

    public void destroyObject(PooledObject<SolrServer> pool) throws Exception {
        SolrServer solrServer = pool.getObject();
        if (solrServer != null) {
            solrServer.shutdown();
            solrServer = null;
        }
    }

    public void activateObject(PooledObject<SolrServer> pool) throws Exception {
        // TODO Auto-generated method stub
    }

    public void passivateObject(PooledObject<SolrServer> pool) throws Exception {
        // TODO Auto-generated method stub
    }

    public boolean validateObject(PooledObject<SolrServer> pool) {
        // TODO Auto-generated method stub
        return false;
    }

}