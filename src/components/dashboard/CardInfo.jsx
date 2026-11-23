import React, { useRef, useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverHeader,
  PopoverBody,
  PopoverCloseButton,
  IconButton,
  Box,
  Text,
  VStack,
  HStack,
  Badge,
  Divider,
  Portal,
} from "@chakra-ui/react";
import { InfoOutlineIcon } from "@chakra-ui/icons";

/**
 * CardInfo — small "i" icon on a dashboard card that explains the card in plain language.
 * Hover to peek; click to pin it open (click again, press Esc or ✕ to close).
 *
 * `info` shape (every field optional):
 * {
 *   what:    "One or two sentences: what this card tells you and why it matters.",
 *   sources: [{ process: "Order List", id: "MS/R/006", note: "optional" }],
 *   included:"Which records are counted / shown (filters, statuses).",
 *   dateFilter: "How the date filter on this card works (field used, default range).",
 *   metrics: [{ name: "Average OEE", how: "Availability × Performance × Quality" }],
 *   columns: [{ name: "DUE", from: "Order List · ORDER DATE + LEAD TIME", how: "days left; negative = overdue" }],
 *   chart:   { type: "Line chart", x: "Month of DELIVERY DATE", y: "Total VALUE", how: "sum per month" },
 *   colors:  [{ label: "Red", meaning: "Not started" }],
 *   tip:     "What to do with it / how to read it.",
 *   note:    "Known limitation to be honest about."
 * }
 */

const Section = ({ title, children }) => (
  <Box>
    <Text
      fontSize="10px"
      fontWeight="bold"
      color="blue.600"
      textTransform="uppercase"
      letterSpacing="wider"
      mb={1}
    >
      {title}
    </Text>
    {children}
  </Box>
);

const Body = ({ children }) => (
  <Text fontSize="xs" color="gray.700" lineHeight="1.5">
    {children}
  </Text>
);

const CardInfo = ({ title, info }) => {
  const [hoverOpen, setHoverOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const closeTimer = useRef(null);

  if (!info) return null;

  const isOpen = pinned || hoverOpen;
  const openHover = () => {
    clearTimeout(closeTimer.current);
    setHoverOpen(true);
  };
  // Small delay so the pointer can travel from the icon into the panel
  const closeHover = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setHoverOpen(false), 200);
  };
  const close = () => {
    setPinned(false);
    setHoverOpen(false);
  };

  const {
    what,
    sources = [],
    included,
    dateFilter,
    metrics = [],
    columns = [],
    chart,
    charts = [],
    colors = [],
    tip,
    note,
  } = info;
  const allCharts = chart ? [chart, ...charts] : charts;

  return (
    <Popover
      isOpen={isOpen}
      onClose={close}
      placement="bottom-start"
      isLazy
      closeOnBlur
    >
      <PopoverTrigger>
        <IconButton
          aria-label={`How "${title || "this card"}" is calculated`}
          title="What does this card show?"
          icon={<InfoOutlineIcon />}
          size="xs"
          variant="ghost"
          color={pinned ? "blue.600" : "gray.400"}
          _hover={{ color: "blue.600", bg: "blue.50" }}
          borderRadius="full"
          onMouseEnter={openHover}
          onMouseLeave={closeHover}
          onClick={() => setPinned((p) => !p)}
        />
      </PopoverTrigger>
      <Portal>
        <PopoverContent
          w={{ base: "92vw", sm: "380px" }}
          maxH="70vh"
          overflowY="auto"
          boxShadow="xl"
          borderColor="blue.100"
          onMouseEnter={openHover}
          onMouseLeave={closeHover}
          _focus={{ outline: "none" }}
        >
          <PopoverArrow />
          <PopoverCloseButton onClick={close} />
          <PopoverHeader
            fontSize="sm"
            fontWeight="bold"
            color="blue.700"
            borderBottomColor="blue.50"
            pr={8}
          >
            {title ? `About: ${title}` : "About this card"}
          </PopoverHeader>
          <PopoverBody>
            <VStack align="stretch" spacing={3} divider={<Divider borderColor="gray.100" />}>
              {what && (
                <Section title="What this shows">
                  <Body>{what}</Body>
                </Section>
              )}

              {sources.length > 0 && (
                <Section title="Where the data comes from">
                  <VStack align="stretch" spacing={1}>
                    {sources.map((s, i) => (
                      <HStack key={i} align="flex-start" spacing={2}>
                        <Badge colorScheme="blue" fontSize="9px" flexShrink={0} mt="2px">
                          {s.id}
                        </Badge>
                        <Body>
                          <b>{s.process}</b>
                          {s.note ? ` — ${s.note}` : ""}
                        </Body>
                      </HStack>
                    ))}
                  </VStack>
                </Section>
              )}

              {included && (
                <Section title="Which records are included">
                  <Body>{included}</Body>
                </Section>
              )}

              {metrics.length > 0 && (
                <Section title="How the numbers are calculated">
                  <VStack align="stretch" spacing={1.5}>
                    {metrics.map((m, i) => (
                      <Body key={i}>
                        <b>{m.name}:</b> {m.how}
                      </Body>
                    ))}
                  </VStack>
                </Section>
              )}

              {columns.length > 0 && (
                <Section title="Columns explained">
                  <VStack align="stretch" spacing={1.5}>
                    {columns.map((c, i) => (
                      <Box key={i}>
                        <Text fontSize="xs" fontWeight="bold" color="gray.800">
                          {c.name}
                        </Text>
                        {c.from && (
                          <Text fontSize="11px" color="gray.500">
                            From: {c.from}
                          </Text>
                        )}
                        {c.how && <Body>{c.how}</Body>}
                      </Box>
                    ))}
                  </VStack>
                </Section>
              )}

              {allCharts.length > 0 && (
                <Section title={allCharts.length > 1 ? "Reading the charts" : "Reading the chart"}>
                  <VStack align="stretch" spacing={2}>
                    {allCharts.map((c, i) => (
                      <Box key={i}>
                        {c.type && (
                          <Text fontSize="xs" fontWeight="bold" color="gray.800">
                            {c.type}
                          </Text>
                        )}
                        {c.x && (
                          <Body>
                            <b>Across (X axis):</b> {c.x}
                          </Body>
                        )}
                        {c.y && (
                          <Body>
                            <b>Up (Y axis):</b> {c.y}
                          </Body>
                        )}
                        {c.slices && (
                          <Body>
                            <b>Slices:</b> {c.slices}
                          </Body>
                        )}
                        {c.how && <Body>{c.how}</Body>}
                      </Box>
                    ))}
                  </VStack>
                </Section>
              )}

              {colors.length > 0 && (
                <Section title="Colours">
                  <VStack align="stretch" spacing={1}>
                    {colors.map((c, i) => (
                      <Body key={i}>
                        <b>{c.label}:</b> {c.meaning}
                      </Body>
                    ))}
                  </VStack>
                </Section>
              )}

              {dateFilter && (
                <Section title="Date filter">
                  <Body>{dateFilter}</Body>
                </Section>
              )}

              {tip && (
                <Box bg="green.50" borderRadius="md" p={2}>
                  <Text fontSize="xs" color="green.800" lineHeight="1.5">
                    <b>Tip:</b> {tip}
                  </Text>
                </Box>
              )}

              {note && (
                <Box bg="orange.50" borderRadius="md" p={2}>
                  <Text fontSize="xs" color="orange.800" lineHeight="1.5">
                    <b>Good to know:</b> {note}
                  </Text>
                </Box>
              )}
            </VStack>
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
};

export default CardInfo;
