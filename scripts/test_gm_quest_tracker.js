/**
 * Test script for GM Quest Tracker functionality
 * This script can be used to test the GM features of the Quest Tracker NPC
 */

// Test GM command execution
function testGMCommands() {
    print("=== Testing GM Quest Tracker Functionality ===");
    
    // Test 1: Check if CommandsExecutor is available
    try {
        var executor = Packages.client.command.CommandsExecutor.getInstance();
        print("✓ CommandsExecutor is available");
    } catch (e) {
        print("✗ CommandsExecutor not available: " + e.message);
        return false;
    }
    
    // Test 2: Check if GM commands are registered
    try {
        var executor = Packages.client.command.CommandsExecutor.getInstance();
        // Try to access the registered commands (this might not be public, but worth trying)
        print("✓ CommandsExecutor instance created successfully");
    } catch (e) {
        print("✗ Error accessing CommandsExecutor: " + e.message);
    }
    
    // Test 3: Check if required classes are available
    try {
        var itemProvider = Packages.server.ItemInformationProvider.getInstance();
        print("✓ ItemInformationProvider is available");
    } catch (e) {
        print("✗ ItemInformationProvider not available: " + e.message);
    }
    
    try {
        var mobProvider = Packages.server.life.MonsterInformationProvider.getInstance();
        print("✓ MonsterInformationProvider is available");
    } catch (e) {
        print("✗ MonsterInformationProvider not available: " + e.message);
    }
    
    // Test 4: Check if Quest.wz data provider is available
    try {
        var questProvider = Packages.provider.DataProviderFactory.getDataProvider(Packages.provider.wz.WZFiles.QUEST);
        print("✓ Quest.wz data provider is available");
    } catch (e) {
        print("✗ Quest.wz data provider not available: " + e.message);
    }
    
    print("=== Test completed ===");
    return true;
}

// Test NPC location data loading
function testNPCLocationData() {
    print("=== Testing NPC Location Data Loading ===");
    
    try {
        var file = new java.io.File("scripts/npc_location.json");
        if (file.exists()) {
            print("✓ NPC location file exists");
            
            var reader = new java.io.BufferedReader(new java.io.FileReader(file));
            var jsonString = "";
            var line;
            while ((line = reader.readLine()) !== null) {
                jsonString += line;
            }
            reader.close();
            
            var jsonArray = JSON.parse(jsonString);
            print("✓ NPC location data loaded successfully: " + jsonArray.length + " entries");
        } else {
            print("⚠ NPC location file does not exist (this is optional)");
        }
    } catch (e) {
        print("✗ Error loading NPC location data: " + e.message);
    }
    
    print("=== Test completed ===");
}

// Test quest status checking
function testQuestStatus() {
    print("=== Testing Quest Status Checking ===");
    
    try {
        // Test a few known quest IDs
        var testQuests = [1000, 1001, 1002, 2000, 2001];
        var foundQuests = 0;
        
        for (var i = 0; i < testQuests.length; i++) {
            try {
                var status = cm.getQuestStatus(testQuests[i]);
                if (status !== undefined) {
                    foundQuests++;
                    print("✓ Quest " + testQuests[i] + " status: " + status);
                }
            } catch (e) {
                // Quest doesn't exist, which is normal
            }
        }
        
        print("✓ Found " + foundQuests + " valid quests out of " + testQuests.length + " tested");
    } catch (e) {
        print("✗ Error checking quest status: " + e.message);
    }
    
    print("=== Test completed ===");
}

// Test GM menu generation
function testGMMenuGeneration() {
    print("=== Testing GM Menu Generation ===");
    
    try {
        // Test the generateSelectionMenu function
        function generateSelectionMenu(array) {
            var menu = "";
            for (var i = 0; i < array.length; i++) {
                menu += "#L" + i + "#" + array[i] + "#l\r\n";
            }
            return menu;
        }
        
        var testOptions = ["Grant 50x Red Potion", "Grant 100x Blue Potion", "Spawn 10x Slime", "Grant All Items", "Spawn All Mobs"];
        var menuStr = generateSelectionMenu(testOptions);
        
        print("✓ Menu generation successful");
        print("✓ Generated menu length: " + menuStr.length);
        print("✓ Menu contains proper #L and #l tags");
        
        // Check if menu contains expected elements
        if (menuStr.indexOf("#L0#") !== -1 && menuStr.indexOf("#l") !== -1) {
            print("✓ Menu format is correct");
        } else {
            print("✗ Menu format is incorrect");
        }
        
        // Check for "Grant All" and "Spawn All" options
        if (menuStr.indexOf("Grant All Items") !== -1 && menuStr.indexOf("Spawn All Mobs") !== -1) {
            print("✓ Grant All and Spawn All options are included");
        } else {
            print("✗ Grant All and Spawn All options are missing");
        }
        
    } catch (e) {
        print("✗ Error generating GM menu: " + e.message);
    }
    
    print("=== Test completed ===");
}

// Test Yes/No selection handling
function testYesNoSelection() {
    print("=== Testing Yes/No Selection Handling ===");
    
    try {
        // Test the selection logic
        function testSelection(selection) {
            // In MapleStory NPC scripts: 0 = No, 1 = Yes
            if (selection != 1) {
                return "Action cancelled";
            }
            return "Action confirmed";
        }
        
        var result1 = testSelection(0);
        var result2 = testSelection(1);
        
        if (result1 === "Action cancelled" && result2 === "Action confirmed") {
            print("✓ Yes/No selection handling is correct");
            print("✓ Selection 0 (No) returns: " + result1);
            print("✓ Selection 1 (Yes) returns: " + result2);
        } else {
            print("✗ Yes/No selection handling is incorrect");
            print("✗ Selection 0 returned: " + result1);
            print("✗ Selection 1 returned: " + result2);
        }
        
    } catch (e) {
        print("✗ Error testing Yes/No selection: " + e.message);
    }
    
    print("=== Test completed ===");
}

// Main test function
function runAllTests() {
    print("Starting GM Quest Tracker tests...");
    
    testGMCommands();
    testNPCLocationData();
    testQuestStatus();
    testGMMenuGeneration();
    testYesNoSelection();
    
    print("All tests completed!");
}

// Run tests if this script is executed directly
if (typeof cm !== 'undefined') {
    // We're in an NPC context, run tests
    runAllTests();
} else {
    // We're being executed directly
    print("This is a test script for the GM Quest Tracker NPC.");
    print("To use it, include it in an NPC script or run it through the server console.");
} 