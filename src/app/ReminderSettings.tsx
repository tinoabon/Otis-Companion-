// src/app/ReminderSettings.tsx
import React, { useState } from "react";
import { ReminderService } from "../services/ReminderService";
import { ReminderConfig, ReminderFrequency, ReminderType } from "../types/reminders";

interface ReminderSettingsProps {
    userId: string;
    reminderService: ReminderService;
    onClose: () => void;
}

export const ReminderSettings: React.FC<ReminderSettingsProps> = ({ userId, reminderService, onClose }) => {
    const existing = reminderService.getReminderConfig(userId);

    const [enabled, setEnabled] = useState(existing ? existing.autoScheduleReminders : true);
    const [morning, setMorning] = useState(existing && existing.preferredTimes.morning ? existing.preferredTimes.morning : "07:00");
    const [afternoon, setAfternoon] = useState(existing && existing.preferredTimes.afternoon ? existing.preferredTimes.afternoon : "14:00");
    const [evening, setEvening] = useState(existing && existing.preferredTimes.evening ? existing.preferredTimes.evening : "18:00");
    const [frequency, setFrequency] = useState(
          existing && existing.frequencyByType[ReminderType.MobilityExercise]
            ? existing.frequencyByType[ReminderType.MobilityExercise]
            : ReminderFrequency.Daily
        );

    const handleSave = () => {
          const config: ReminderConfig = {
                  userId,
                  enablePushNotifications: true,
                  preferredTimes: { morning, afternoon, evening },
                  frequencyByType: {
                            [ReminderType.MobilityExercise]: frequency,
                            [ReminderType.CheckIn]: frequency,
                            [ReminderType.Recovery]: frequency
                  },
                  autoScheduleReminders: enabled
          };

          reminderService.saveReminderConfig(userId, config);
          reminderService.clearScheduledReminders(userId);
          if (enabled) {
                  reminderService.autoScheduleReminders(userId, config);
          }

          onClose();
    };

    return (
          <div className="settings-overlay">
                <div className="settings-panel">
                        <h2>Movement Reminders</h2>
                
                        <label className="settings-row">
                                  <input
                                                type="checkbox"
                                                checked={enabled}
                                                onChange={(e) => setEnabled(e.target.checked)}
                                              />
                                  Enable daily movement reminders
                        </label>
                
                        <label className="settings-row">
                                  Morning mobility
                                  <input type="time" value={morning} onChange={(e) => setMorning(e.target.value)} />
                        </label>
                
                        <label className="settings-row">
                                  Afternoon check-in
                                  <input type="time" value={afternoon} onChange={(e) => setAfternoon(e.target.value)} />
                        </label>
                
                        <label className="settings-row">
                                  Evening recovery
                                  <input type="time" value={evening} onChange={(e) => setEvening(e.target.value)} />
                        </label>
                
                        <label className="settings-row">
                                  Frequency
                                  <select value={frequency} onChange={(e) => setFrequency(e.target.value as ReminderFrequency)}>
                                              <option value={ReminderFrequency.Daily}>Every day</option>
                                              <option value={ReminderFrequency.ThreeTimesWeek}>3x a week</option>
                                              <option value={ReminderFrequency.TwiceWeekly}>2x a week</option>
                                              <option value={ReminderFrequency.Weekly}>Once a week</option>
                                  </select>
                        </label>
                
                        <div className="settings-actions">
                                  <button className="settings-cancel" onClick={onClose}>Cancel</button>
                                  <button className="settings-save" onClick={handleSave}>Save</button>
                        </div>
                </div>
          </div>
        );
};
