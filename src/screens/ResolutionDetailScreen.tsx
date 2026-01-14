import React, {useState, useCallback, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import ConfettiCannon from 'react-native-confetti-cannon';
import {
  Resolution,
  Milestone,
  JournalEntry,
  isResolutionComplete,
} from '../types';
import {
  loadResolutions,
  saveResolutions,
  createJournalEntry,
} from '../storage/resolutions';
import {colors, fonts, fontWeights, spacing, emptyStates} from '../theme';

type RootStackParamList = {
  Home: undefined;
  ResolutionDetail: {id: string};
  ResolutionEdit: {id?: string};
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ResolutionDetail'>;
  route: RouteProp<RootStackParamList, 'ResolutionDetail'>;
};

function MilestoneItem({
  milestone,
  onToggle,
}: {
  milestone: Milestone;
  onToggle: () => void;
}) {
  return (
    <TouchableOpacity style={styles.milestoneItem} onPress={onToggle}>
      <View
        style={[styles.checkbox, milestone.completed && styles.checkboxChecked]}>
        {milestone.completed && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <View style={styles.milestoneContent}>
        <Text
          style={[
            styles.milestoneTitle,
            milestone.completed && styles.milestoneCompleted,
          ]}>
          {milestone.title}
        </Text>
        {milestone.targetDate && (
          <Text style={styles.milestoneDate}>
            Target: {new Date(milestone.targetDate).toLocaleDateString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

function JournalEntryItem({entry}: {entry: JournalEntry}) {
  const date = new Date(entry.createdAt);
  return (
    <View style={styles.journalEntry}>
      <Text style={styles.journalDate}>
        {date.toLocaleDateString()} {date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
      </Text>
      <Text style={styles.journalText}>{entry.text}</Text>
    </View>
  );
}

export default function ResolutionDetailScreen({navigation, route}: Props) {
  const {id} = route.params;
  const [resolution, setResolution] = useState<Resolution | null>(null);
  const [allResolutions, setAllResolutions] = useState<Resolution[]>([]);
  const [whatsNextText, setWhatsNextText] = useState('');
  const [newJournalText, setNewJournalText] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef<any>(null);
  const wasCompleteRef = useRef(false);

  const loadData = useCallback(async () => {
    const data = await loadResolutions();
    setAllResolutions(data);
    const found = data.find(r => r.id === id);
    if (found) {
      setResolution(found);
      setWhatsNextText(found.whatsNext || '');
      wasCompleteRef.current = isResolutionComplete(found);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const saveAndUpdate = async (updated: Resolution) => {
    const newResolutions = allResolutions.map(r =>
      r.id === updated.id ? updated : r,
    );
    await saveResolutions(newResolutions);
    setAllResolutions(newResolutions);
    setResolution(updated);

    // Check if just became complete
    const nowComplete = isResolutionComplete(updated);
    if (nowComplete && !wasCompleteRef.current) {
      setShowConfetti(true);
      wasCompleteRef.current = true;
      // Mark as completed
      const withCompletedAt = {
        ...updated,
        completedAt: new Date().toISOString(),
      };
      const finalResolutions = newResolutions.map(r =>
        r.id === withCompletedAt.id ? withCompletedAt : r,
      );
      await saveResolutions(finalResolutions);
      setAllResolutions(finalResolutions);
      setResolution(withCompletedAt);
    }
  };

  const toggleMilestone = async (milestoneId: string) => {
    if (!resolution) return;

    const updatedMilestones = resolution.milestones.map(m =>
      m.id === milestoneId
        ? {
            ...m,
            completed: !m.completed,
            completedAt: !m.completed ? new Date().toISOString() : undefined,
          }
        : m,
    );

    const updated = {...resolution, milestones: updatedMilestones};
    await saveAndUpdate(updated);
  };

  const saveWhatsNext = async () => {
    if (!resolution) return;
    // Only save if the text has changed
    if (whatsNextText !== resolution.whatsNext) {
      const updated = {...resolution, whatsNext: whatsNextText};
      await saveAndUpdate(updated);
    }
  };

  const addJournalEntry = async () => {
    if (!resolution || !newJournalText.trim()) return;

    const entry = createJournalEntry(newJournalText.trim());
    const updated = {
      ...resolution,
      journalEntries: [entry, ...resolution.journalEntries],
    };
    await saveAndUpdate(updated);
    setNewJournalText('');
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Resolution',
      'Are you sure? This cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const filtered = allResolutions.filter(r => r.id !== id);
            await saveResolutions(filtered);
            navigation.goBack();
          },
        },
      ],
    );
  };

  if (!resolution) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const isComplete = isResolutionComplete(resolution);

  return (
    <View style={styles.container}>
      {showConfetti && (
        <ConfettiCannon
          ref={confettiRef}
          count={200}
          origin={{x: -10, y: 0}}
          autoStart={true}
          fadeOut={true}
          colors={colors.confetti}
          onAnimationEnd={() => setShowConfetti(false)}
        />
      )}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, isComplete && styles.titleComplete]}>
            {resolution.title}
          </Text>
          {resolution.description ? (
            <Text style={styles.description}>{resolution.description}</Text>
          ) : null}
          {isComplete && (
            <View style={styles.completeBadge}>
              <Text style={styles.completeBadgeText}>✓ Complete!</Text>
            </View>
          )}
        </View>

        {/* What's Next */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's Next?</Text>
          <TextInput
            style={styles.whatsNextInput}
            value={whatsNextText}
            onChangeText={setWhatsNextText}
            onBlur={saveWhatsNext}
            placeholder="What's the next small step? (Don't Panic)"
            placeholderTextColor={colors.textMuted}
            multiline
          />
        </View>

        {/* Milestones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Milestones ({resolution.milestones.filter(m => m.completed).length}/
            {resolution.milestones.length})
          </Text>
          {resolution.milestones.length === 0 ? (
            <Text style={styles.emptyText}>{emptyStates.noMilestones}</Text>
          ) : (
            resolution.milestones.map(milestone => (
              <MilestoneItem
                key={milestone.id}
                milestone={milestone}
                onToggle={() => toggleMilestone(milestone.id)}
              />
            ))
          )}
        </View>

        {/* Journal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Journal</Text>
          <View style={styles.journalInput}>
            <TextInput
              style={styles.journalTextInput}
              value={newJournalText}
              onChangeText={setNewJournalText}
              placeholder="How's it going? Any improbable developments?"
              placeholderTextColor={colors.textMuted}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.journalAddButton,
                !newJournalText.trim() && styles.journalAddButtonDisabled,
              ]}
              onPress={addJournalEntry}
              disabled={!newJournalText.trim()}>
              <Text style={styles.journalAddButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          {resolution.journalEntries.length === 0 ? (
            <Text style={styles.emptyText}>{emptyStates.noJournalEntries}</Text>
          ) : (
            resolution.journalEntries.map(entry => (
              <JournalEntryItem key={entry.id} entry={entry} />
            ))
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('ResolutionEdit', {id})}>
            <Text style={styles.editButtonText}>Edit Resolution</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: fonts.medium,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fonts.title,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  titleComplete: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  description: {
    fontSize: fonts.medium,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  completeBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: spacing.md,
  },
  completeBadgeText: {
    color: colors.textPrimary,
    fontWeight: fontWeights.semibold,
    fontSize: fonts.small,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fonts.large,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  whatsNextInput: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: fonts.medium,
    minHeight: 60,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  checkmark: {
    color: colors.background,
    fontWeight: fontWeights.bold,
    fontSize: fonts.small,
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: fonts.medium,
    color: colors.textPrimary,
  },
  milestoneCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  milestoneDate: {
    fontSize: fonts.small,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fonts.small,
    fontStyle: 'italic',
  },
  journalInput: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  journalTextInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: fonts.medium,
    marginRight: spacing.sm,
    minHeight: 60,
  },
  journalAddButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  journalAddButtonDisabled: {
    backgroundColor: colors.surfaceLight,
  },
  journalAddButtonText: {
    color: colors.background,
    fontWeight: fontWeights.semibold,
  },
  journalEntry: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  journalDate: {
    fontSize: fonts.tiny,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  journalText: {
    fontSize: fonts.medium,
    color: colors.textPrimary,
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  editButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
  },
  editButtonText: {
    color: colors.primary,
    fontWeight: fontWeights.semibold,
    fontSize: fonts.medium,
  },
  deleteButton: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  deleteButtonText: {
    color: colors.warning,
    fontWeight: fontWeights.semibold,
    fontSize: fonts.medium,
  },
});
