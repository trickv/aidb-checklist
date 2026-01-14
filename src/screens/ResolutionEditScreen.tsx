import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {Resolution, Milestone} from '../types';
import {
  loadResolutions,
  saveResolutions,
  createResolution,
  createMilestone,
} from '../storage/resolutions';
import {colors, fonts, fontWeights, spacing, placeholders} from '../theme';

type RootStackParamList = {
  Home: undefined;
  ResolutionDetail: {id: string};
  ResolutionEdit: {id?: string};
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ResolutionEdit'>;
  route: RouteProp<RootStackParamList, 'ResolutionEdit'>;
};

function MilestoneEditor({
  milestone,
  onUpdate,
  onDelete,
}: {
  milestone: Milestone;
  onUpdate: (updated: Milestone) => void;
  onDelete: () => void;
}) {
  return (
    <View style={styles.milestoneEditor}>
      <View style={styles.milestoneInputRow}>
        <TextInput
          style={styles.milestoneInput}
          value={milestone.title}
          onChangeText={title => onUpdate({...milestone, title})}
          placeholder={placeholders.milestoneTitle}
          placeholderTextColor={colors.textMuted}
        />
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.dateInput}
        value={milestone.targetDate ? milestone.targetDate.split('T')[0] : ''}
        onChangeText={date => {
          if (date) {
            onUpdate({...milestone, targetDate: new Date(date).toISOString()});
          } else {
            const {targetDate, ...rest} = milestone;
            onUpdate(rest as Milestone);
          }
        }}
        placeholder="Target date (YYYY-MM-DD, optional)"
        placeholderTextColor={colors.textMuted}
      />
    </View>
  );
}

export default function ResolutionEditScreen({navigation, route}: Props) {
  const {id} = route.params;
  const isEditing = !!id;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [allResolutions, setAllResolutions] = useState<Resolution[]>([]);
  const [originalResolution, setOriginalResolution] = useState<Resolution | null>(null);

  useEffect(() => {
    loadResolutions().then(data => {
      setAllResolutions(data);
      if (id) {
        const found = data.find(r => r.id === id);
        if (found) {
          setOriginalResolution(found);
          setTitle(found.title);
          setDescription(found.description);
          setMilestones(found.milestones);
        }
      }
    });
  }, [id]);

  const addMilestone = () => {
    const newMilestone = createMilestone('');
    setMilestones([...milestones, newMilestone]);
  };

  const updateMilestone = (index: number, updated: Milestone) => {
    const newMilestones = [...milestones];
    newMilestones[index] = updated;
    setMilestones(newMilestones);
  };

  const deleteMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Oops', 'Please enter a title for your resolution.');
      return;
    }

    // Filter out empty milestones
    const validMilestones = milestones.filter(m => m.title.trim());

    let updatedResolutions: Resolution[];

    if (isEditing && originalResolution) {
      // Update existing
      const updated: Resolution = {
        ...originalResolution,
        title: title.trim(),
        description: description.trim(),
        milestones: validMilestones,
      };
      updatedResolutions = allResolutions.map(r =>
        r.id === id ? updated : r,
      );
    } else {
      // Create new
      const newResolution = createResolution(title.trim(), description.trim());
      newResolution.milestones = validMilestones;
      updatedResolutions = [...allResolutions, newResolution];
    }

    await saveResolutions(updatedResolutions);

    if (isEditing) {
      navigation.goBack();
    } else {
      // Go to the new resolution's detail page
      const newId = updatedResolutions[updatedResolutions.length - 1].id;
      navigation.replace('ResolutionDetail', {id: newId});
    }
  };

  const handleCancel = () => {
    if (title.trim() || description.trim() || milestones.some(m => m.title.trim())) {
      Alert.alert(
        'Discard changes?',
        'You have unsaved changes.',
        [
          {text: 'Keep editing', style: 'cancel'},
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Resolution' : 'New Resolution'}
        </Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder={placeholders.resolutionTitle}
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder={placeholders.resolutionDescription}
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Milestones</Text>
          <Text style={styles.hint}>
            Add checkpoints for your resolution. Complete all to celebrate!
          </Text>

          {milestones.map((milestone, index) => (
            <MilestoneEditor
              key={milestone.id}
              milestone={milestone}
              onUpdate={updated => updateMilestone(index, updated)}
              onDelete={() => deleteMilestone(index)}
            />
          ))}

          <TouchableOpacity style={styles.addMilestone} onPress={addMilestone}>
            <Text style={styles.addMilestoneText}>+ Add Milestone</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  headerTitle: {
    fontSize: fonts.large,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
  },
  cancelButton: {
    fontSize: fonts.medium,
    color: colors.textSecondary,
  },
  saveButton: {
    fontSize: fonts.medium,
    color: colors.primary,
    fontWeight: fontWeights.semibold,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fonts.medium,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  hint: {
    fontSize: fonts.small,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: fonts.medium,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  milestoneEditor: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  milestoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  milestoneInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: fonts.medium,
    padding: spacing.sm,
    backgroundColor: colors.surfaceLight,
    borderRadius: 6,
  },
  deleteButton: {
    marginLeft: spacing.sm,
    padding: spacing.sm,
  },
  deleteButtonText: {
    color: colors.warning,
    fontSize: fonts.xlarge,
    fontWeight: fontWeights.bold,
  },
  dateInput: {
    color: colors.textSecondary,
    fontSize: fonts.small,
    padding: spacing.sm,
    backgroundColor: colors.surfaceLight,
    borderRadius: 6,
    marginTop: spacing.sm,
  },
  addMilestone: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
  },
  addMilestoneText: {
    color: colors.primary,
    fontSize: fonts.medium,
    fontWeight: fontWeights.semibold,
  },
});
