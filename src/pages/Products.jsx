import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Flex,
  HStack,
  Heading,
  Text,
  Button,
  IconButton,
  SimpleGrid,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Spinner,
  Center,
  useToast,
} from "@chakra-ui/react";
import { Icon } from "@iconify/react";

// importing components
import ProductListCard from "../components/ProductListCard";
import CategoryCard from "../components/products/CategoryCard";
import ManageCategoriesDialog from "../components/products/ManageCategoriesDialog";
import CardInfo from "../components/dashboard/CardInfo";
import DisabledWithTooltip from "../components/DisabledWithTooltip";
import FormDialog from "../hooks/FormDialog";

// importing API's
import Product from "../services/Product";
import { getCategoryTree, apiErrorMessage } from "../services/Category";
import { usePermissions, ACCESS_DENIED_TOOLTIP } from "../services/permissions";

// Importing styles
import "../styles/product.css";

const PAGE_INFO = {
  what: "Your product catalogue, organised as a tree: Categories → Sub-categories → (more sub-categories, as deep as needed) → Products.",
  metrics: [
    {
      name: "1. Pick a category",
      how: "Click a category card to open it. Each card shows how many sub-categories and products are inside.",
    },
    {
      name: "2. Go deeper",
      how: "Click a sub-category card to open it. Sub-categories can contain more sub-categories; keep clicking until you see the products.",
    },
    {
      name: "3. Open a product",
      how: "Products placed at the level you are on are listed under the sub-category cards. Click one to see its full details and graph.",
    },
    {
      name: "Go back",
      how: "Use the path at the top (Products › Category › …) to jump back to any level. The browser Back button works too, and a refresh keeps your place.",
    },
    {
      name: "Add a product (admin)",
      how: "Open the sub-category it belongs to and press \"Add Product\". Only Name and Part No are required; the other specs can be filled in later.",
    },
    {
      name: "⚙ Settings (admin)",
      how: "Create, rename, switch off, move or delete categories and sub-categories. Switched-off (inactive) items are hidden here.",
    },
  ],
  tip: "Counts on a card include everything inside it, at every level below.",
};

const PRODUCT_FORM_FIELDS = [
  { key: "name", label: "Name *" },
  { key: "partNo", label: "Part No *" },
  { key: "description", label: "Description" },
  { key: "series", label: "Series" },
  { key: "image", label: "Image" },
  { key: "portSize", label: "Port Size" },
  { key: "bodySize", label: "Body Size" },
  { key: "material", label: "Material" },
  { key: "standard", label: "Standard" },
  { key: "operatingPressure", label: "Operating Pressure" },
  { key: "pressureDrop", label: "Pressure Drop" },
  { key: "ratedFlow", label: "Rated Flow" },
  { key: "sealingMaterial", label: "Sealing Material" },
  { key: "suggestedFlow", label: "Suggested Flow" },
  { key: "temperature", label: "Temperature" },
];

const PRODUCT_SELECTS = [
  {
    key: "status",
    label: "Status",
    options: ["Waiting for order", "Order confirm", "Under progress", "Supplied to customer"],
  },
];

const emptyProduct = (category, subCategory) => ({
  name: "",
  description: "",
  partNo: "",
  series: "",
  image: "",
  portSize: "",
  bodySize: "",
  material: "",
  standard: "",
  operatingPressure: "",
  pressureDrop: "",
  ratedFlow: "",
  sealingMaterial: "",
  suggestedFlow: "",
  temperature: "",
  status: "",
  graphRows: [],
  category,
  subCategory,
});

function Products() {
  const toast = useToast();
  const products = useSelector((state) => state.product.products) || [];
  const { handleGetAllProducts, handleCreateProduct, loading: productsLoading } = Product();
  const { isAdmin } = usePermissions();

  const [searchParams, setSearchParams] = useSearchParams();
  const [tree, setTree] = useState([]);
  const [treeLoading, setTreeLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [productDraft, setProductDraft] = useState(null); // initial data of the open Add Product form

  // ---- where are we? (?category=<id>&path=<subId>,<subId>) ----
  const categoryId = searchParams.get("category");
  const pathIds = useMemo(
    () => (searchParams.get("path") || "").split(",").filter(Boolean),
    [searchParams],
  );

  const loadTree = useCallback(async () => {
    setTreeLoading(true);
    try {
      setTree(await getCategoryTree(false));
    } catch (error) {
      toast({
        status: "error",
        title: "Could not load categories",
        description: apiErrorMessage(error),
        isClosable: true,
      });
    } finally {
      setTreeLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadTree();
  }, [loadTree]);

  // Resolve the URL ids against the tree (ids that no longer exist or are inactive are dropped)
  const { category, trail } = useMemo(() => {
    const cat = tree.find((c) => String(c._id) === String(categoryId)) || null;
    const nodes = [];
    let level = cat?.subcategories || [];
    for (const id of pathIds) {
      const next = level.find((n) => String(n._id) === String(id));
      if (!next) break;
      nodes.push(next);
      level = next.children || [];
    }
    return { category: cat, trail: nodes };
  }, [tree, categoryId, pathIds]);

  const current = trail[trail.length - 1] || null; // current sub-category (null at category level)
  const childCards = current ? current.children || [] : category ? category.subcategories || [] : [];

  // Products placed directly at the current sub-category
  useEffect(() => {
    if (current?._id) {
      handleGetAllProducts({ category: category?._id, subCategory: current._id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?._id]);

  const goTo = (catId, ids = []) => {
    const next = {};
    if (catId) next.category = String(catId);
    if (ids.length) next.path = ids.map(String).join(",");
    setSearchParams(next);
  };

  const openCategory = (cat) => goTo(cat._id);
  const openSub = (node) => goTo(category._id, [...trail.map((n) => n._id), node._id]);

  // ---- Add Product ----
  const openAddProduct = () => setProductDraft(emptyProduct(category._id, current._id));

  // FormDialog calls onClose() right after handleSubmit, so reopening must wait for that close
  const reopenForm = (data) =>
    setTimeout(() => setProductDraft({ ...emptyProduct(category._id, current._id), ...data }), 0);

  const handleFormSubmit = async (data) => {
    const payload = { ...data, category: category._id, subCategory: current._id };
    delete payload.graphRows;
    delete payload.xAxis;
    delete payload.yAxis;
    if (!String(payload.name || "").trim() || !String(payload.partNo || "").trim()) {
      toast({ status: "warning", title: "Name and Part No are required", isClosable: true });
      reopenForm(data);
      return;
    }
    const result = await handleCreateProduct(payload);
    if (result?.ok) {
      setProductDraft(null);
      handleGetAllProducts({ category: category._id, subCategory: current._id });
      loadTree(); // refresh counts on the cards
    } else {
      // Reopen with what the user typed so nothing is lost (server message is shown as a toast)
      reopenForm(data);
    }
  };

  const closeSettings = (changed) => {
    setSettingsOpen(false);
    if (changed) loadTree();
  };

  // ---- render ----
  const heading = current ? current.name : category ? category.name : "Products";
  const showProducts = !!current;
  const nothingHere = !childCards.length && (!showProducts || !products.length);

  return (
    <Box className="AppRightContainer ProductsContainer" p={{ base: 4, md: 6 }}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={4} gap={3} flexWrap="wrap">
        <HStack spacing={2}>
          <Heading size="lg" color="gray.800">
            Products
          </Heading>
          <CardInfo title="Products page" info={PAGE_INFO} />
        </HStack>
        <HStack spacing={2}>
          {current && (
            <DisabledWithTooltip isDisabled={!isAdmin} label={ACCESS_DENIED_TOOLTIP}>
              <Button
                colorScheme="blue"
                leftIcon={<Icon icon="mdi:plus" width="18" />}
                onClick={openAddProduct}
                isDisabled={!isAdmin}
                size="sm"
              >
                Add Product
              </Button>
            </DisabledWithTooltip>
          )}
          <DisabledWithTooltip isDisabled={!isAdmin} label={ACCESS_DENIED_TOOLTIP}>
            <IconButton
              aria-label="Manage categories"
              title="Manage categories & sub-categories"
              icon={<Icon icon="mdi:cog-outline" width="20" />}
              onClick={() => setSettingsOpen(true)}
              isDisabled={!isAdmin}
              size="sm"
              variant="outline"
            />
          </DisabledWithTooltip>
        </HStack>
      </Flex>

      {/* Breadcrumb */}
      <Breadcrumb
        mb={5}
        fontSize="sm"
        color="gray.600"
        separator={<Icon icon="mdi:chevron-right" width="16" />}
        spacing={1}
      >
        <BreadcrumbItem isCurrentPage={!category}>
          <BreadcrumbLink onClick={() => goTo(null)} fontWeight={!category ? "semibold" : "normal"}>
            All categories
          </BreadcrumbLink>
        </BreadcrumbItem>
        {category && (
          <BreadcrumbItem isCurrentPage={!trail.length}>
            <BreadcrumbLink onClick={() => goTo(category._id)} fontWeight={!trail.length ? "semibold" : "normal"}>
              {category.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
        )}
        {trail.map((node, i) => (
          <BreadcrumbItem key={node._id} isCurrentPage={i === trail.length - 1}>
            <BreadcrumbLink
              onClick={() => goTo(category._id, trail.slice(0, i + 1).map((n) => n._id))}
              fontWeight={i === trail.length - 1 ? "semibold" : "normal"}
            >
              {node.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
        ))}
      </Breadcrumb>

      {treeLoading && !tree.length ? (
        <Center h="200px">
          <Spinner color="blue.500" />
        </Center>
      ) : (
        <>
          {/* Category / sub-category cards */}
          {(!category ? tree : childCards).length > 0 && (
            <Box mb={8}>
              <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mb={3}>
                {!category ? "Categories" : `Sub-categories in ${heading}`}
              </Text>
              <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing={4}>
                {(!category ? tree : childCards).map((node) => (
                  <CategoryCard
                    key={node._id}
                    node={node}
                    kind={!category ? "category" : "sub"}
                    onOpen={() => (!category ? openCategory(node) : openSub(node))}
                  />
                ))}
              </SimpleGrid>
            </Box>
          )}

          {/* Products at this level */}
          {showProducts && (
            <Box>
              <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mb={3}>
                Products in {heading}
              </Text>
              {productsLoading ? (
                <Center h="120px">
                  <Spinner color="blue.500" />
                </Center>
              ) : products.length ? (
                <div className="ProductListContainer">
                  {products.map((product) => (
                    <ProductListCard key={product._id} product={product} />
                  ))}
                </div>
              ) : null}
            </Box>
          )}

          {/* Empty states */}
          {!category && !tree.length && (
            <EmptyState
              icon="mdi:folder-plus-outline"
              title="No categories yet"
              text={
                isAdmin
                  ? "Use the ⚙ settings button to create your first category and its sub-categories."
                  : "Nothing here yet. Ask an admin to set up the product categories."
              }
            />
          )}
          {category && nothingHere && !productsLoading && (
            <EmptyState
              icon="mdi:package-variant"
              title={`Nothing in ${heading} yet`}
              text={
                isAdmin
                  ? current
                    ? "Press \"Add Product\" to add a product here, or use ⚙ settings to add sub-categories inside it."
                    : "Use ⚙ settings to add sub-categories to this category."
                  : "Nothing here yet."
              }
            />
          )}
        </>
      )}

      {/* Add Product */}
      {productDraft && (
        <FormDialog
          IndicationText={`Add Product to ${heading}`}
          FormArray={PRODUCT_FORM_FIELDS}
          SelectArray={PRODUCT_SELECTS}
          initialData={productDraft}
          handleSubmit={handleFormSubmit}
          isOpen={!!productDraft}
          onClose={() => setProductDraft(null)}
          mode="create-graph"
        />
      )}

      {/* Settings */}
      {isAdmin && (
        <ManageCategoriesDialog
          isOpen={settingsOpen}
          onClose={closeSettings}
          initialCategoryId={category?._id || null}
        />
      )}
    </Box>
  );
}

const EmptyState = ({ icon, title, text }) => (
  <Center
    flexDirection="column"
    py={12}
    px={6}
    border="1px dashed"
    borderColor="gray.300"
    borderRadius="xl"
    bg="gray.50"
    textAlign="center"
  >
    <Box color="gray.400" mb={2}>
      <Icon icon={icon} width="40" />
    </Box>
    <Text fontWeight="semibold" color="gray.700">
      {title}
    </Text>
    <Text fontSize="sm" color="gray.500" mt={1} maxW="420px">
      {text}
    </Text>
  </Center>
);

export default Products;
