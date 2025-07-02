/*
 This file is part of the OdinMS Maple Story Server
 Copyright (C) 2008 Patrick Huy <patrick.huy@frz.cc>
 Matthias Butz <matze@odinms.de>
 Jan Christian Meyer <vimes@odinms.de>

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation version 3 as published by
 the Free Software Foundation. You may not use, modify or distribute
 this program under any other version of the GNU Affero General Public
 License.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package server;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import provider.Data;
import provider.DataProvider;
import provider.DataProviderFactory;
import provider.DataTool;
import provider.wz.WZFiles;
import tools.Pair;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @author CPURules
 */
public class SkillInformationProvider {
    private static final Logger log = LoggerFactory.getLogger(SkillInformationProvider.class);
    private final static SkillInformationProvider instance = new SkillInformationProvider();

    public static SkillInformationProvider getInstance() {
        return instance;
    }

    protected DataProvider skillData;
    protected DataProvider stringData;
    protected Data skillStringData;
    protected Map<Integer, String> nameCache = new HashMap<>();
    protected List<Pair<Integer, String>> skillNameCache = new ArrayList<>();


    private SkillInformationProvider() {
        skillData = DataProviderFactory.getDataProvider(WZFiles.SKILL);
        stringData = DataProviderFactory.getDataProvider(WZFiles.STRING);
        skillStringData = stringData.getData("Skill.img");
    }

    public List<Pair<Integer, String>> getAllSkills() {
        if (!skillNameCache.isEmpty()) {
            return skillNameCache;
        }

        List<Pair<Integer, String>> itemPairs = new ArrayList<>();
        for (Data skillFolder: skillStringData.getChildren()) {
            itemPairs.add(new Pair<>(Integer.parseInt(skillFolder.getName()), DataTool.getString("name", skillFolder, "NO-NaME")));
        }

        return itemPairs;
    }

    private Data getStringData(int skillId) {
        return skillStringData.getChildByPath(String.valueOf(skillId));
    }

    public String getName(int skillId) {
        if (nameCache.containsKey(skillId)) {
            return nameCache.get(skillId);
        }
        Data strings = getStringData(skillId);
        if (strings == null) {
            return null;
        }
        String ret = DataTool.getString("name", strings, null);
        nameCache.put(skillId, ret);
        return ret;
    }
}
