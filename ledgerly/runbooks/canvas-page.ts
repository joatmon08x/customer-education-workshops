import { beatFeature, cardBlocks } from "@/runbooks/static-page";
import { RUNBOOK_TRACKS, trackOptionalFeatures } from "@/runbooks/tracks";

export const STATIC_CANVAS_PATH = "runbooks.canvas.tsx";

type CanvasBlock =
  | { kind: "say"; text: string }
  | { kind: "steps"; lines: string[] }
  | { kind: "prompt"; text: string; label: string };

type CanvasBeat = {
  id: string;
  title: string;
  feature?: string;
  blocks: CanvasBlock[];
};

type CanvasSection = {
  id: string;
  title: string;
  beats: CanvasBeat[];
};

type CanvasTrack = {
  id: string;
  title: string;
  description: string;
  features: string[];
  sections: CanvasSection[];
};

export function canvasTracks(): CanvasTrack[] {
  return RUNBOOK_TRACKS.map((track) => ({
    id: track.id,
    title: track.title,
    description: track.description,
    features: trackOptionalFeatures(track),
    sections: track.sections.map((section) => ({
      id: section.id,
      title: section.title,
      beats: section.beats.map((beat) => {
        const feature = beatFeature(beat);
        const blocks = cardBlocks(beat);
        return feature
          ? { id: beat.id, title: beat.title, feature, blocks }
          : { id: beat.id, title: beat.title, blocks };
      }),
    })),
  }));
}

export function renderRunbooksCanvas(): string {
  const data = JSON.stringify(canvasTracks(), null, 2);
  const trackIdUnion = RUNBOOK_TRACKS.map((track) => `"${track.id}"`).join(" | ");
  return `import {
  Button,
  Card,
  CardBody,
  Checkbox,
  H1,
  H2,
  Row,
  Stack,
  Text,
  useCanvasState,
  useHostTheme,
  useState,
} from "cursor/canvas";

type TrackId = ${trackIdUnion};
type Block =
  | { kind: "say"; text: string }
  | { kind: "steps"; lines: string[] }
  | { kind: "prompt"; text: string; label: string };
type Beat = { id: string; title: string; feature?: string; blocks: Block[] };
type NumberedBeat = Beat & { number: number };
type Section = { id: string; title: string; beats: Beat[] };
type NumberedSection = { id: string; title: string; beats: NumberedBeat[] };
type Track = {
  id: TrackId;
  title: string;
  description: string;
  features: string[];
  sections: Section[];
};
type FeatureMap = Record<string, Record<string, boolean>>;

const TRACKS: Track[] = ${data};

function numberedSections(track: Track, hidden: Record<string, boolean>): NumberedSection[] {
  const sections: NumberedSection[] = [];
  let number = 0;
  for (const section of track.sections) {
    const beats: NumberedBeat[] = [];
    for (const beat of section.beats) {
      if (beat.feature && hidden[beat.feature] === false) continue;
      number += 1;
      beats.push({ ...beat, number });
    }
    if (beats.length) sections.push({ id: section.id, title: section.title, beats });
  }
  return sections;
}

function CopyPrompt({ text, label }: { text: string; label: string }) {
  const theme = useHostTheme();
  const [copied, setCopied] = useState(false);

  function copy() {
    const done = function () {
      setCopied(true);
      window.setTimeout(function () {
        setCopied(false);
      }, 1600);
    };
    const fallback = function () {
      const area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      document.body.removeChild(area);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done).catch(function () {
        fallback();
        done();
      });
      return;
    }
    fallback();
    done();
  }

  return (
    <Stack gap={8}>
      <Row align="center" justify="space-between" gap={8}>
        <Text size="small" weight="semibold" as="span">
          {label}
        </Text>
        <Button variant="secondary" onClick={copy}>
          {copied ? "Copied" : "Copy"}
        </Button>
      </Row>
      <pre
        style={{
          margin: 0,
          padding: 12,
          overflow: "auto",
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
          background: theme.fill.tertiary,
          color: theme.text.primary,
          border: "1px solid " + theme.stroke.tertiary,
          borderRadius: 8,
          font: "12px/1.6 ui-monospace, SFMono-Regular, Menlo, monospace",
        }}
      >
        {text}
      </pre>
    </Stack>
  );
}

function BeatCard({ beat }: { beat: NumberedBeat }) {
  const theme = useHostTheme();
  return (
    <Card>
      <CardBody>
        <Stack gap={12}>
          <Stack gap={4}>
            <Text size="small" tone="secondary" weight="semibold">
              {"Step " + beat.number + (beat.feature ? " · Optional: " + beat.feature : "")}
            </Text>
            <Text weight="semibold" style={{ overflowWrap: "anywhere" }}>
              {beat.title}
            </Text>
          </Stack>
          {beat.blocks.map(function (block, index) {
            if (block.kind === "say") {
              return (
                <Text
                  key={beat.id + "-say-" + index}
                  tone="secondary"
                  size="small"
                  style={{ whiteSpace: "pre-line", overflowWrap: "anywhere" }}
                >
                  {block.text}
                </Text>
              );
            }
            if (block.kind === "steps") {
              const Tag = block.lines.length > 1 ? "ol" : "ul";
              return (
                <Tag
                  key={beat.id + "-steps-" + index}
                  style={{
                    margin: 0,
                    padding: "12px 12px 12px 28px",
                    background: theme.fill.secondary,
                    border: "1px solid " + theme.stroke.tertiary,
                    borderRadius: 8,
                    color: theme.text.primary,
                    fontSize: 12,
                    lineHeight: 1.6,
                    overflowWrap: "anywhere",
                  }}
                >
                  {block.lines.map(function (line) {
                    return <li key={line}>{line}</li>;
                  })}
                </Tag>
              );
            }
            return (
              <CopyPrompt
                key={beat.id + "-prompt-" + index}
                text={block.text}
                label={block.label}
              />
            );
          })}
        </Stack>
      </CardBody>
    </Card>
  );
}

export default function Runbooks() {
  const theme = useHostTheme();
  const [trackId, setTrackId] = useCanvasState<TrackId>("runbooks-track", "101");
  const [features, setFeatures] = useCanvasState<FeatureMap>("runbooks-features", {});

  const track = TRACKS.find(function (entry) {
    return entry.id === trackId;
  }) ?? TRACKS[0];
  const hidden = features[track.id] ?? {};
  const sections = numberedSections(track, hidden);

  function setFeature(feature: string, on: boolean) {
    setFeatures(function (prev) {
      const nextTrack = { ...(prev[track.id] ?? {}) };
      if (on) delete nextTrack[feature];
      else nextTrack[feature] = false;
      return { ...prev, [track.id]: nextTrack };
    });
  }

  return (
    <Stack gap={0} style={{ height: "100%", minHeight: "100vh", background: theme.bg.editor }}>
      <Stack
        gap={12}
        style={{
          padding: 12,
          borderBottom: "1px solid " + theme.stroke.tertiary,
          background: theme.bg.chrome,
        }}
      >
        <Row align="center" justify="space-between" gap={8} wrap>
          <H1>Runbooks</H1>
          <Row gap={8} wrap>
            {TRACKS.map(function (entry) {
              return (
                <Button
                  key={entry.id}
                  variant={entry.id === track.id ? "primary" : "secondary"}
                  onClick={function () {
                    setTrackId(entry.id);
                  }}
                >
                  {entry.title}
                </Button>
              );
            })}
          </Row>
        </Row>
        <Text tone="secondary" size="small">
          {track.description}
        </Text>
        {track.features.length > 0 ? (
          <Row gap={12} wrap>
            {track.features.map(function (feature) {
              return (
                <Checkbox
                  key={feature}
                  checked={hidden[feature] !== false}
                  onChange={function (on) {
                    setFeature(feature, on);
                  }}
                  label={feature}
                />
              );
            })}
          </Row>
        ) : null}
      </Stack>
      <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        <Stack gap={24} style={{ padding: 16, width: "100%", boxSizing: "border-box" }}>
          {sections.map(function (section) {
            return (
              <Stack key={section.id} gap={12}>
                <H2>{section.title}</H2>
                {section.beats.map(function (beat) {
                  return <BeatCard key={beat.id} beat={beat} />;
                })}
              </Stack>
            );
          })}
        </Stack>
      </div>
    </Stack>
  );
}
`;
}
