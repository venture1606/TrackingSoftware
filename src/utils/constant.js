export const groupItemsHelper = (key) => {
  switch (key) {
    case "PART-NO":
    case "PART-NAME":
    case "TYPE":
    case "MATERIAL":
      return "groupOfItems";
    case "ITEM-NAME":
    case "GRADE":
      return "groupOfItemList";
    case "VENDOR-NAME":
      return "groupOfVendorList";
    case "CUSTOMER-NAME":
      return "groupOfCustomerList";
    default:
      return "";
  }
};

export const findAutoFillData = (groupItem, key, value) => {
  const listName = groupItemsHelper(key);
  if (!listName || !groupItem || !groupItem[listName]) return null;

  const list = groupItem[listName];
  if (!Array.isArray(list)) return null;

  const searchValue = value?.toString().trim().toLowerCase();
  if (!searchValue) return null;

  const flattenedList = list.flat();

  for (const item of flattenedList) {
    const itemValue = item?.[key]?.toString().trim().toLowerCase();
    if (itemValue === searchValue) {
      return item;
    }
  }
  return null;
};

/**
 * Filters and merges options based on groupItem and current form state.
 */
export const getFilteredOptions = (
  groupItem,
  formData,
  targetKey,
  defaultOptions = [],
) => {
  const listName = groupItemsHelper(targetKey);
  if (!listName || !groupItem || !groupItem[listName]) return defaultOptions;

  const list = groupItem[listName];
  const flattenedList = Array.isArray(list) ? list.flat() : [];

  // Find other fields in the same group that already have a value selected
  const relatedFields = formData.filter(
    (f) =>
      f.key !== targetKey &&
      groupItemsHelper(f.key) === listName &&
      f.value &&
      f.value !== "" &&
      f.value !== "others",
  );

  // If no related fields are selected, show everything (Default + All from Group)
  if (relatedFields.length === 0) {
    const allGroupOptions = new Set();
    flattenedList.forEach((item) => {
      if (item && item[targetKey]) {
        allGroupOptions.add(item[targetKey]);
      }
    });
    const combined = Array.from(
      new Set([...defaultOptions, ...allGroupOptions]),
    );
    return combined.length > 0 ? combined : defaultOptions;
  }

  // If there ARE related fields, filter strictly based on group data
  const filteredList = flattenedList.filter((item) => {
    return relatedFields.every((field) => {
      const itemVal = item[field.key]?.toString().toLowerCase().trim();
      const formVal = field.value?.toString().toLowerCase().trim();
      return itemVal === formVal;
    });
  });

  const groupOptions = new Set();
  filteredList.forEach((item) => {
    if (item && item[targetKey]) {
      groupOptions.add(item[targetKey]);
    }
  });

  const groupOptionsArray = Array.from(groupOptions);

  // Return ONLY matched options from the group data to ensure strict filtering
  if (groupOptionsArray.length > 0) {
    return groupOptionsArray;
  }

  // Fallback to default options ONLY if no matches were found in group data at all
  return defaultOptions;
};
