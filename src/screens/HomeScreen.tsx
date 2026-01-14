import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Resolution, getCompletionStatus, CompletionStatus} from '../types';
import {loadResolutions} from '../storage/resolutions';
import {colors, fonts, fontWeights, spacing, getRandomEmptyMessage} from '../theme';

type RootStackParamList = {
  Home: undefined;
  ResolutionDetail: {id: string};
  ResolutionEdit: {id?: string};
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

function StatusIndicator({status}: {status: CompletionStatus}) {
  const statusColors = {
    not_started: colors.notStarted,
    in_progress: colors.inProgress,
    complete: colors.complete,
  };

  return (
    <View style={[styles.statusDot, {backgroundColor: statusColors[status]}]} />
  );
}

function ResolutionItem({
  resolution,
  onPress,
}: {
  resolution: Resolution;
  onPress: () => void;
}) {
  const status = getCompletionStatus(resolution);
  const completedCount = resolution.milestones.filter(m => m.completed).length;
  const totalCount = resolution.milestones.length;

  return (
    <TouchableOpacity style={styles.resolutionItem} onPress={onPress}>
      <View style={styles.resolutionContent}>
        <View style={styles.resolutionHeader}>
          <StatusIndicator status={status} />
          <Text
            style={[
              styles.resolutionTitle,
              status === 'complete' && styles.completedTitle,
            ]}
            numberOfLines={1}>
            {resolution.title}
          </Text>
        </View>
        {resolution.description ? (
          <Text style={styles.resolutionDescription} numberOfLines={2}>
            {resolution.description}
          </Text>
        ) : null}
        {totalCount > 0 && (
          <Text style={styles.milestoneCount}>
            {completedCount}/{totalCount} milestones
          </Text>
        )}
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen({navigation}: Props) {
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [emptyMessage] = useState(() => getRandomEmptyMessage('noResolutions'));

  const loadData = useCallback(async () => {
    const data = await loadResolutions();
    setResolutions(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const renderItem = ({item}: {item: Resolution}) => (
    <ResolutionItem
      resolution={item}
      onPress={() => navigation.navigate('ResolutionDetail', {id: item.id})}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>2026 Resolutions</Text>
        <Text style={styles.subtitle}>Don't Panic</Text>
      </View>

      {resolutions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('ResolutionEdit', {})}>
            <Text style={styles.addButtonText}>+ Add Resolution</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={resolutions}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
              />
            }
          />
          <TouchableOpacity
            style={styles.fab}
            onPress={() => navigation.navigate('ResolutionEdit', {})}>
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fonts.title,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: fonts.medium,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: 100,
  },
  resolutionItem: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  resolutionContent: {
    flex: 1,
  },
  resolutionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  resolutionTitle: {
    fontSize: fonts.large,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
    flex: 1,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  resolutionDescription: {
    fontSize: fonts.small,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginLeft: spacing.md + spacing.sm,
  },
  milestoneCount: {
    fontSize: fonts.tiny,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginLeft: spacing.md + spacing.sm,
  },
  chevron: {
    fontSize: fonts.xlarge,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: fonts.medium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  addButtonText: {
    color: colors.background,
    fontSize: fonts.medium,
    fontWeight: fontWeights.semibold,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 28,
    color: colors.background,
    fontWeight: fontWeights.bold,
  },
});
