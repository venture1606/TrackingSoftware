import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Input,
  Select,
  Switch,
  Button,
  IconButton,
  Spinner,
  Center,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { Icon } from "@iconify/react";

import CardInfo from "../dashboard/CardInfo";
import Confirmation from "../../hooks/Confirmation";
import {
  getCategoryTree,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  apiErrorMessage,
} from "../../services/Category";

const NEW_CATEGORY = "__new__";

const SETTINGS_INFO = {
  what: "Build the product tree here: categories, the sub-categories inside them, and as many levels of sub-categories inside those as you need. Products are added later on the Products page, inside any sub-category.",
  metrics: [
    {
      name: "Add a category",
      how: "Choose \"+ Add category\" in the Category dropdown, type the name and press Save Changes.",
    },
    {
      name: "Add a sub-category",
      how: "Click the category name (for a top-level sub-category) or any sub-category (to nest inside it), then press \"+ Add Subcategory\" at the bottom left.",
    },
    {
      name: "Rename / switch off",
      how: "Click an item, change its name or the Active switch, then Save Changes. Inactive items (grey dot) are hidden from the Products page together with everything under them, but nothing is deleted.",
    },
    {
      name: "Move",
      how: "Open a sub-category and pick a different Parent — the sub-category moves there together with its own sub-categories and products.",
    },
    {
      name: "Delete",
      how: "The red bin deletes the selected item. Only empty items can be deleted: first delete or move its sub-categories, and move its products elsewhere.",
    },
  ],
  colors: [
    { label: "Green dot", meaning: "Active — shown on the Products page." },
    { label: "Grey dot", meaning: "Inactive — hidden from the Products page." },
  ],
};

// ---- tree helpers ---------------------------------------------------------
const findNode = (nodes, id) => {
  for (const n of nodes || []) {
    if (String(n._id) === String(id)) return n;
    const hit = findNode(n.children, id);
    if (hit) return hit;
  }
  return null;
};

const flatten = (nodes, depth = 0, out = []) => {
  (nodes || []).forEach((n) => {
    out.push({ node: n, depth });
    flatten(n.children, depth + 1, out);
  });
  return out;
};

const descendantIds = (node, set = new Set()) => {
  (node?.children || []).forEach((c) => {
    set.add(String(c._id));
    descendantIds(c, set);
  });
  return set;
};

// Ancestor ids (closest first) of a sub-category inside one category's sub-tree
const ancestorsOf = (nodes, id, trail = []) => {
  for (const n of nodes || []) {
    if (String(n._id) === String(id)) return trail;
    const found = ancestorsOf(n.children, id, [n, ...trail]);
    if (found) return found;
  }
  return null;
};

const ActiveDot = ({ active }) => (
  <Box
    boxSize="8px"
    borderRadius="full"
    bg={active ? "green.400" : "gray.300"}
    flexShrink={0}
    title={active ? "Active" : "Inactive"}
  />
);

const blankForm = { name: "", isActive: true, parent: "" };

function ManageCategoriesDialog({ isOpen, onClose, initialCategoryId = null }) {
  const toast = useToast();
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changed, setChanged] = useState(false);
  const [categoryId, setCategoryId] = useState(null);
  // selection.mode: "category" | "sub" | "newSub" | "newCategory"
  const [selection, setSelection] = useState({ mode: "category", id: null, parentId: null });
  const [form, setForm] = useState(blankForm);
  const [original, setOriginal] = useState(blankForm);
  const [expanded, setExpanded] = useState(() => new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);

  const category = useMemo(
    () => tree.find((c) => String(c._id) === String(categoryId)) || null,
    [tree, categoryId],
  );
  const subs = useMemo(() => category?.subcategories || [], [category]);
  const selectedSub =
    selection.mode === "sub" ? findNode(subs, selection.id) : null;

  const notify = (status, title, description) =>
    toast({ status, title, description, duration: status === "error" ? 5000 : 2500, isClosable: true });

  const showCategory = useCallback((cat) => {
    const f = cat ? { name: cat.name, isActive: cat.isActive, parent: "" } : blankForm;
    setSelection({ mode: "category", id: cat?._id || null, parentId: null });
    setForm(f);
    setOriginal(f);
  }, []);

  const showSub = (node) => {
    const f = { name: node.name, isActive: node.isActive, parent: node.parent ? String(node.parent) : "" };
    setSelection({ mode: "sub", id: node._id, parentId: null });
    setForm(f);
    setOriginal(f);
  };

  // Load (or reload) the full tree including inactive items
  const loadTree = useCallback(
    async () => {
      setLoading(true);
      try {
        const data = await getCategoryTree(true);
        setTree(data);
        return data;
      } catch (error) {
        notify("error", "Could not load categories", apiErrorMessage(error));
        return null;
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Open: load and select the category the user was browsing (or the first one)
  useEffect(() => {
    if (!isOpen) return;
    setChanged(false);
    setExpanded(new Set());
    loadTree().then((data) => {
      if (!data) return;
      const start =
        data.find((c) => String(c._id) === String(initialCategoryId)) || data[0] || null;
      setCategoryId(start?._id || null);
      if (start) showCategory(start);
      else {
        setSelection({ mode: "newCategory", id: null, parentId: null });
        setForm(blankForm);
        setOriginal(blankForm);
      }
    });
  }, [isOpen, initialCategoryId, loadTree, showCategory]);

  const handleCategorySelect = (value) => {
    if (value === NEW_CATEGORY) {
      setSelection({ mode: "newCategory", id: null, parentId: null });
      setForm(blankForm);
      setOriginal(blankForm);
      return;
    }
    const cat = tree.find((c) => String(c._id) === value);
    setCategoryId(cat?._id || null);
    setExpanded(new Set());
    showCategory(cat);
  };

  const startAddSub = () => {
    if (!category) return;
    const parentId = selection.mode === "sub" ? selection.id : null;
    if (parentId) setExpanded((prev) => new Set(prev).add(String(parentId)));
    setSelection({ mode: "newSub", id: null, parentId });
    setForm(blankForm);
    setOriginal(blankForm);
  };

  const isNew = selection.mode === "newSub" || selection.mode === "newCategory";
  const dirty = isNew
    ? form.name.trim() !== ""
    : form.name.trim() !== original.name.trim() ||
      form.isActive !== original.isActive ||
      form.parent !== original.parent;

  const handleCancel = () => {
    if (selection.mode === "newCategory" && !category) {
      setForm(blankForm);
      return;
    }
    if (isNew) {
      const parent = selection.parentId ? findNode(subs, selection.parentId) : null;
      if (parent) showSub(parent);
      else showCategory(category);
      return;
    }
    setForm(original);
  };

  // After a save, reselect the same thing from the fresh tree
  const reselect = (data, catId, subId) => {
    const cat = data.find((c) => String(c._id) === String(catId)) || data[0] || null;
    setCategoryId(cat?._id || null);
    const node = subId && cat ? findNode(cat.subcategories, subId) : null;
    if (node) {
      const ancestors = ancestorsOf(cat.subcategories, node._id) || [];
      setExpanded((prev) => {
        const next = new Set(prev);
        ancestors.forEach((a) => next.add(String(a._id)));
        return next;
      });
      showSub(node);
    } else {
      showCategory(cat);
    }
  };

  const handleSave = async () => {
    const name = form.name.trim();
    if (!name) {
      notify("warning", "Please enter a name");
      return;
    }
    setSaving(true);
    try {
      if (selection.mode === "newCategory") {
        const created = await createCategory({ name, isActive: form.isActive });
        const data = await loadTree();
        if (data) reselect(data, created._id, null);
        notify("success", `Category "${name}" created`, "Now add its sub-categories with \"+ Add Subcategory\".");
      } else if (selection.mode === "category") {
        await updateCategory(selection.id, { name, isActive: form.isActive });
        const data = await loadTree();
        if (data) reselect(data, selection.id, null);
        notify("success", "Category saved");
      } else if (selection.mode === "newSub") {
        const created = await createSubCategory({
          name,
          category: categoryId,
          parent: selection.parentId || null,
          isActive: form.isActive,
        });
        const data = await loadTree();
        if (data) reselect(data, categoryId, created._id);
        notify("success", `Sub-category "${name}" created`);
      } else if (selection.mode === "sub") {
        const update = {};
        if (name !== original.name.trim()) update.name = name;
        if (form.isActive !== original.isActive) update.isActive = form.isActive;
        if (form.parent !== original.parent) update.parent = form.parent || null;
        await updateSubCategory(selection.id, update);
        const data = await loadTree();
        if (data) reselect(data, categoryId, selection.id);
        notify("success", update.parent !== undefined ? "Sub-category moved and saved" : "Sub-category saved");
      }
      setChanged(true);
    } catch (error) {
      notify("error", "Not saved", apiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setConfirmOpen(false);
    setSaving(true);
    try {
      if (selection.mode === "category") {
        await deleteCategory(selection.id);
        const data = await loadTree();
        if (data) {
          const next = data[0] || null;
          setCategoryId(next?._id || null);
          if (next) showCategory(next);
          else {
            setSelection({ mode: "newCategory", id: null, parentId: null });
            setForm(blankForm);
            setOriginal(blankForm);
          }
        }
        notify("success", "Category deleted");
      } else if (selection.mode === "sub") {
        const parentId = selectedSub?.parent || null;
        await deleteSubCategory(selection.id);
        const data = await loadTree();
        if (data) reselect(data, categoryId, parentId);
        notify("success", "Sub-category deleted");
      }
      setChanged(true);
    } catch (error) {
      notify("error", "Not deleted", apiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const toggleExpand = (id) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      const key = String(id);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  // Parent choices for a sub-category: top level, or any node except itself / its descendants
  const parentOptions = useMemo(() => {
    if (selection.mode !== "sub" || !selectedSub) return [];
    const blocked = descendantIds(selectedSub);
    blocked.add(String(selectedSub._id));
    return flatten(subs).filter(({ node }) => !blocked.has(String(node._id)));
  }, [selection.mode, selectedSub, subs]);

  const newSubLocation = useMemo(() => {
    if (selection.mode !== "newSub" || !category) return "";
    if (!selection.parentId) return category.name;
    const parent = findNode(subs, selection.parentId);
    const ancestors = parent ? ancestorsOf(subs, parent._id) || [] : [];
    return [category.name, ...ancestors.slice().reverse().map((a) => a.name), parent?.name]
      .filter(Boolean)
      .join(" › ");
  }, [selection, category, subs]);

  const TreeRow = ({ node, depth }) => {
    const hasChildren = (node.children || []).length > 0;
    const isOpenNode = expanded.has(String(node._id));
    const isSelected =
      (selection.mode === "sub" && String(selection.id) === String(node._id)) ||
      (selection.mode === "newSub" && String(selection.parentId) === String(node._id));
    return (
      <>
        <Flex
          align="center"
          gap={1}
          pl={`${12 + depth * 18}px`}
          pr={4}
          py={2.5}
          cursor="pointer"
          bg={isSelected ? "gray.100" : "transparent"}
          border="1px solid"
          borderColor={isSelected ? "gray.700" : "transparent"}
          _hover={{ bg: isSelected ? "gray.100" : "gray.50" }}
          onClick={() => showSub(node)}
        >
          <Box
            as="span"
            w="20px"
            display="inline-flex"
            justifyContent="center"
            color="gray.500"
            onClick={(e) => {
              if (!hasChildren) return;
              e.stopPropagation();
              toggleExpand(node._id);
            }}
          >
            {hasChildren && (
              <Icon icon={isOpenNode ? "mdi:chevron-down" : "mdi:chevron-right"} width="18" />
            )}
          </Box>
          <Text
            flex="1"
            fontSize="sm"
            color={isSelected ? "blue.500" : node.isActive ? "gray.800" : "gray.400"}
            fontWeight={isSelected ? "semibold" : "normal"}
            noOfLines={1}
          >
            {node.name}
          </Text>
          <ActiveDot active={node.isActive} />
        </Flex>
        {hasChildren &&
          isOpenNode &&
          node.children.map((c) => <TreeRow key={c._id} node={c} depth={depth + 1} />)}
      </>
    );
  };

  const panelTitle = {
    category: "Edit category",
    sub: "Edit subcategory",
    newSub: "Add subcategory",
    newCategory: "Add category",
  }[selection.mode];
  const nameLabel =
    selection.mode === "category" || selection.mode === "newCategory"
      ? "Category name"
      : "Subcategory name";
  const canDelete = selection.mode === "category" || selection.mode === "sub";

  const close = () => onClose?.(changed);

  return (
    <Modal isOpen={isOpen} onClose={close} size="6xl" scrollBehavior="inside" isCentered>
      <ModalOverlay />
      <ModalContent maxH="88vh">
        <ModalHeader borderBottom="1px solid" borderColor="gray.100">
          <HStack spacing={2}>
            <IconButton
              aria-label="Back to products"
              icon={<Icon icon="mdi:chevron-left" width="22" />}
              size="sm"
              variant="ghost"
              onClick={close}
            />
            <Text fontWeight="medium">Manage Categories</Text>
            <CardInfo title="Manage Categories" info={SETTINGS_INFO} />
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p={4}>
          {loading && !tree.length ? (
            <Center h="300px">
              <Spinner color="blue.500" />
            </Center>
          ) : (
            <Flex
              border="1px solid"
              borderColor="gray.200"
              borderRadius="md"
              minH="60vh"
              direction={{ base: "column", md: "row" }}
            >
              {/* ---- Left: category + sub-category tree ---- */}
              <Flex
                direction="column"
                w={{ base: "100%", md: "340px" }}
                flexShrink={0}
                borderRight={{ md: "1px solid" }}
                borderBottom={{ base: "1px solid", md: "none" }}
                borderColor="gray.200"
              >
                <Box px={5} pt={5} pb={4} borderBottom="1px solid" borderColor="gray.200">
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    Category
                  </Text>
                  <Select
                    value={selection.mode === "newCategory" ? NEW_CATEGORY : categoryId || ""}
                    onChange={(e) => handleCategorySelect(e.target.value)}
                    placeholder={tree.length ? undefined : "No categories yet"}
                  >
                    {tree.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                        {c.isActive ? "" : " (inactive)"}
                      </option>
                    ))}
                    <option value={NEW_CATEGORY}>+ Add category</option>
                  </Select>
                </Box>

                {category && selection.mode !== "newCategory" && (
                  <>
                    <Flex
                      align="center"
                      px={5}
                      py={3}
                      cursor="pointer"
                      borderBottom="1px solid"
                      borderColor="gray.200"
                      bg={selection.mode === "category" ? "gray.100" : "transparent"}
                      _hover={{ bg: "gray.50" }}
                      onClick={() => showCategory(category)}
                    >
                      <Text
                        flex="1"
                        color={selection.mode === "category" ? "blue.500" : "gray.800"}
                        fontWeight={selection.mode === "category" ? "semibold" : "normal"}
                        noOfLines={1}
                      >
                        {category.name}
                      </Text>
                      <ActiveDot active={category.isActive} />
                    </Flex>
                    <Text fontSize="xs" color="gray.600" px={5} pt={4} pb={2}>
                      Subcategories
                    </Text>
                    <Box flex="1" overflowY="auto" maxH={{ md: "48vh" }}>
                      {subs.length ? (
                        subs.map((n) => <TreeRow key={n._id} node={n} depth={0} />)
                      ) : (
                        <Text fontSize="sm" color="gray.500" px={5} py={2}>
                          No subcategories yet.
                        </Text>
                      )}
                    </Box>
                    <Box borderTop="1px solid" borderColor="gray.200" px={5} py={4}>
                      <Tooltip
                        label={
                          selection.mode === "sub"
                            ? `Add inside "${selectedSub?.name || ""}"`
                            : `Add directly under "${category.name}"`
                        }
                        hasArrow
                      >
                        <Button
                          variant="link"
                          colorScheme="blue"
                          leftIcon={<Icon icon="mdi:plus" width="20" />}
                          onClick={startAddSub}
                          fontWeight="medium"
                        >
                          Add Subcategory
                        </Button>
                      </Tooltip>
                    </Box>
                  </>
                )}
              </Flex>

              {/* ---- Right: edit / add panel ---- */}
              <Flex direction="column" flex="1" p={6} minW={0}>
                <Flex justify="space-between" align="center" mb={6}>
                  <Text fontSize="lg" fontWeight="medium" color="gray.800">
                    {panelTitle}
                  </Text>
                  <HStack spacing={1}>
                    {selection.mode === "sub" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="blue"
                        leftIcon={<Icon icon="mdi:plus" width="16" />}
                        onClick={startAddSub}
                      >
                        Add inside
                      </Button>
                    )}
                    {canDelete && (
                      <Tooltip label="Delete (only when it has no sub-categories or products)" hasArrow>
                        <IconButton
                          aria-label="Delete"
                          icon={<Icon icon="mdi:trash-can-outline" width="20" />}
                          size="sm"
                          variant="ghost"
                          color="red.500"
                          onClick={() => setConfirmOpen(true)}
                          isDisabled={saving}
                        />
                      </Tooltip>
                    )}
                  </HStack>
                </Flex>

                {selection.mode === "newSub" && (
                  <Box bg="blue.50" borderRadius="md" px={3} py={2} mb={5}>
                    <Text fontSize="sm" color="blue.700">
                      New subcategory will be created under: <b>{newSubLocation}</b>
                    </Text>
                  </Box>
                )}

                <VStack align="stretch" spacing={6} flex="1">
                  <Box>
                    <Text fontSize="md" color="gray.600" mb={2}>
                      {nameLabel}
                    </Text>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder={nameLabel}
                      borderColor="gray.800"
                      autoFocus={isNew}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && dirty && !saving) handleSave();
                      }}
                    />
                  </Box>

                  <Box>
                    <Text fontSize="md" color="gray.600" mb={2}>
                      Active
                    </Text>
                    <HStack spacing={2}>
                      <Switch
                        isChecked={form.isActive}
                        onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                      />
                      <Text>{form.isActive ? "Active" : "Inactive"}</Text>
                    </HStack>
                    {!form.isActive && (
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Hidden from the Products page together with everything under it. Nothing is deleted.
                      </Text>
                    )}
                  </Box>

                  {selection.mode === "sub" && (
                    <Box>
                      <Text fontSize="md" color="gray.600" mb={2}>
                        Parent
                      </Text>
                      <Select
                        value={form.parent}
                        onChange={(e) => setForm((f) => ({ ...f, parent: e.target.value }))}
                      >
                        <option value="">— Top level (directly under {category?.name}) —</option>
                        {parentOptions.map(({ node, depth }) => (
                          <option key={node._id} value={String(node._id)}>
                            {`${"   ".repeat(depth)}${depth ? "└ " : ""}${node.name}`}
                          </option>
                        ))}
                      </Select>
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Change this to move the subcategory (with everything inside it).
                      </Text>
                    </Box>
                  )}
                </VStack>

                <Flex justify="flex-end" align="center" gap={6} mt={8}>
                  <Button variant="link" colorScheme="blue" onClick={handleCancel} isDisabled={saving}>
                    Cancel
                  </Button>
                  <Button
                    colorScheme="blue"
                    onClick={handleSave}
                    isDisabled={!dirty}
                    isLoading={saving}
                    px={6}
                  >
                    {isNew ? "Save" : "Save Changes"}
                  </Button>
                </Flex>
              </Flex>
            </Flex>
          )}
        </ModalBody>
      </ModalContent>

      <Confirmation
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title={selection.mode === "category" ? "Delete this category?" : "Delete this subcategory?"}
        message={`"${form.name || original.name}" will be removed permanently. This only works when it has no subcategories and no products.`}
      />
    </Modal>
  );
}

export default ManageCategoriesDialog;
