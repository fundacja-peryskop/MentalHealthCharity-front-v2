import { List, ListItem, Section, Typography, XStack } from "@fundacja-peryskop/ui";
import { ArrowRight } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { topics, topicsHeading } from "../content";
import { TopicIcon } from "../illustrations/TopicIcon";
import { PageContainer } from "../../layout/PageContainer";
import { useIconColor } from "../../layout/useIconColor";

const LIST_RESET: React.CSSProperties = { listStyle: "none", margin: 0, padding: 0 };
const LINK_RESET: React.CSSProperties = { textDecoration: "none", display: "block", width: "100%" };

/**
 * §4.5 — topics grid. A data-driven list of outlined pill rows, each with a
 * decorative per-topic icon, a label, and a trailing arrow marking it as a
 * link. Renders as a semantic `<ul>`/`<li>`; the 3-column grid collapses to two
 * then one column on smaller viewports.
 */
export function TopicsGrid() {
    const iconColor = useIconColor();

    return (
        <Section paddingVertical="$xxxl" alignItems="center">
            <PageContainer gap="$xl" alignItems="center">
                <Typography variant="title2" tag="h2" align="center">
                    {topicsHeading}
                </Typography>

                <List
                    flexDirection="row"
                    flexWrap="wrap"
                    justifyContent="center"
                    gap="$md"
                    width="100%"
                    style={LIST_RESET}
                >
                    {topics.map((topic) => (
                        <ListItem key={topic.id} width="100%" $sm={{ width: "48%" }} $md={{ width: "31.5%" }}>
                            <RouterLink to={topic.href} style={LINK_RESET}>
                                <XStack
                                    alignItems="center"
                                    justifyContent="space-between"
                                    gap="$sm"
                                    paddingVertical="$md"
                                    paddingHorizontal="$lg"
                                    borderRadius="$lg"
                                    borderWidth={1}
                                    borderColor="$borderColor"
                                    backgroundColor="$background"
                                    cursor="pointer"
                                    hoverStyle={{
                                        borderColor: "$primary",
                                        backgroundColor: "$backgroundHover",
                                    }}
                                >
                                    <XStack alignItems="center" gap="$md" flex={1}>
                                        <TopicIcon id={topic.id} />
                                        <Typography variant="regularSemibold">{topic.label}</Typography>
                                    </XStack>
                                    <ArrowRight size={18} color={iconColor.muted} />
                                </XStack>
                            </RouterLink>
                        </ListItem>
                    ))}
                </List>
            </PageContainer>
        </Section>
    );
}
