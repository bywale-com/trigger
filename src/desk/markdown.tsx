import { Typography, theme } from "antd";
import type { ReactNode } from "react";
import { parseFactoryMarkdown, type Inline } from "./markdown.ts";

const { Paragraph, Text, Title, Link } = Typography;

function renderInline(nodes: Inline[]): ReactNode[] {
  return nodes.map((node, index) => {
    if (node.type === "text") return <span key={index}>{node.value}</span>;
    if (node.type === "code") return <Text key={index} code>{node.value}</Text>;
    if (node.type === "strong") return <Text key={index} strong>{renderInline(node.children)}</Text>;
    if (node.type === "em") return <Text key={index} italic>{renderInline(node.children)}</Text>;
    return (
      <Link key={index} href={node.href} target={node.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
        {renderInline(node.children)}
      </Link>
    );
  });
}

export function FactoryMarkdown({
  text,
  testId = "page-prose",
  stripTitle = false,
}: {
  text: string | null | undefined;
  testId?: string;
  stripTitle?: boolean;
}) {
  const { token } = theme.useToken();
  const blocks = parseFactoryMarkdown(text ?? "", { stripTitle });
  if (!blocks.length) return <Paragraph data-testid={testId}>—</Paragraph>;
  return (
    <div className="page-prose" data-testid={testId}>
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const level = block.level <= 2 ? 4 : 5;
          return (
            <Title key={index} level={level} style={{ marginTop: index === 0 ? 0 : 16 }}>
              {renderInline(block.children)}
            </Title>
          );
        }
        if (block.type === "list") {
          const List = block.ordered ? "ol" : "ul";
          return (
            <List key={index} style={{ margin: "0 0 12px", paddingLeft: 22 }}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex} style={{ marginBottom: 4 }}>
                  {renderInline(item)}
                </li>
              ))}
            </List>
          );
        }
        if (block.type === "code") {
          return (
            <pre
              key={index}
              style={{
                margin: "0 0 12px",
                padding: 12,
                borderRadius: 6,
                background: token.colorFillTertiary,
                overflow: "auto",
                fontSize: 13,
              }}
            >
              <code>{block.value}</code>
            </pre>
          );
        }
        if (block.type === "quote") {
          return (
            <blockquote
              key={index}
              style={{
                margin: "0 0 12px",
                paddingLeft: 12,
                borderLeft: `3px solid ${token.colorSplit}`,
                color: token.colorTextSecondary,
              }}
            >
              {renderInline(block.children)}
            </blockquote>
          );
        }
        if (block.type === "hr") {
          return <hr key={index} style={{ border: 0, borderTop: `1px solid ${token.colorSplit}`, margin: "16px 0" }} />;
        }
        return (
          <Paragraph key={index} style={{ marginBottom: 12 }}>
            {renderInline(block.children)}
          </Paragraph>
        );
      })}
    </div>
  );
}
