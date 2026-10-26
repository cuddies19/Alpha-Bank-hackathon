import { SourceCheckItem } from '@/entities/application';
import { Alert, Button, Cluster, Section, Text, useToast } from '@/shared/ui';
import { useCaseData } from './useCaseData';

export function ChecksTab() {
  const { checks, checksAt } = useCaseData();
  const toast = useToast();
  const requested = () =>
    toast.show({
      tone: 'info',
      title: 'Запросы отправлены повторно',
      description: 'Ответы появятся здесь через несколько секунд',
    });
  return (
    <Section
      title="Внешние проверки"
      subtitle={`${checks.length} источника · ${checksAt}`}
      aside={
        <Button size="sm" onClick={requested}>
          Запросить всё повторно
        </Button>
      }
    >
      {checks.map((check) => (
        <SourceCheckItem key={check.id} check={check}>
          {check.note ? (
            <Alert tone="info" title={check.note.title}>
              {check.note.text}
            </Alert>
          ) : null}
          {check.status === 'fail' ? (
            <>
              <Text>БКИ не ответило за 10 секунд, 3 попытки. Проверьте вручную.</Text>
              <Cluster>
                <Button size="sm" onClick={requested}>
                  Запросить повторно
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    toast.show({
                      title: 'Отмечено: проверено вручную',
                      description: 'Запись добавлена в журнал аудита',
                    })
                  }
                >
                  Отметить как проверено вручную
                </Button>
              </Cluster>
            </>
          ) : null}
        </SourceCheckItem>
      ))}
    </Section>
  );
}
