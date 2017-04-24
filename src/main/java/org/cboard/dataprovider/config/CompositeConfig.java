package org.cboard.dataprovider.config;

import java.util.ArrayList;
import java.util.Iterator;

/**
 * Created by zyong on 2017/4/24.
 */
public class CompositeConfig extends ConfigComponent {
    ArrayList<ConfigComponent> configComponents = new ArrayList<ConfigComponent>();

    @Override
    public void print() {
        Iterator<ConfigComponent> iterator = configComponents.iterator();
        while (iterator.hasNext()) {
            ConfigComponent menuComponent = (ConfigComponent) iterator.next();
            System.out.println(" AND ");
            menuComponent.print();
        }
    }
}
