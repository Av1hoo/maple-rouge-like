package client;

import com.fasterxml.jackson.annotation.JsonProperty;

public class LoveLetterQuest {
    private boolean completed;

    public LoveLetterQuest() {
        this.completed = false;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }
}