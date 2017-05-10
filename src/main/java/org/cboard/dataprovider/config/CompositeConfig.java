package org.cboard.dataprovider.config;

import java.util.ArrayList;
import java.util.Iterator;

/**
 * Created by zyong on 2017/4/24.
 */
public class CompositeConfig extends ConfigComponent {

    private String type;

    private ArrayList<ConfigComponent> configComponents = new ArrayList<ConfigComponent>();

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public ArrayList<ConfigComponent> getConfigComponents() {
        return configComponents;
    }

    public void setConfigComponents(ArrayList<ConfigComponent> configComponents) {
        this.configComponents = configComponents;
    }

    @Override
    public Iterator<ConfigComponent> getIterator() {
        return configComponents.iterator();
    }
}
