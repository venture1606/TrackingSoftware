import React, { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDispatch } from "react-redux";
import { Box, Flex, Text, Tooltip, Collapse, VStack } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";

// importing the datas
import ItemsData from "../utils/ItemsData.json";
import { usePermissions } from "../services/permissions";

const MotionBox = motion(Box);

function SideBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { DepartmentsListName, SideHeadersList } = ItemsData;

  const { accessibleDepartments, hasAccessToDepartment, isAdmin } =
    usePermissions();

  // Filter departments based on user permissions
  const filteredDepartments = useMemo(() => {
    if (!accessibleDepartments || accessibleDepartments.length === 0) return [];

    return DepartmentsListName.filter((dept) => hasAccessToDepartment(dept));
  }, [DepartmentsListName, accessibleDepartments, hasAccessToDepartment]);

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Use CSS Variables from :root - Switched to --third-color for header sync
  const bgColor = "var(--third-color)";
  const textColor = "var(--text-primary-color)";
  const hoverBg = "rgba(255, 255, 255, 0.08)";
  const activeBg = "rgba(255, 255, 255, 0.12)";
  const glassEffect = {
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
  };

  const icons = useMemo(
    () => [
      "duo-icons:dashboard",
      "fluent-mdl2:product-release",
      "mingcute:department-fill",
      "hugeicons:inequality-square-01",
      "icon-park-outline:sales-report",
      "bx:purchase-tag-alt",
      "material-symbols:manufacturing-rounded",
      "mingcute:stock-line",
      "fluent:building-32-regular",
      "hugeicons:master-card",
    ],
    [],
  );

  const handleDepartment = (dept) => {
    navigate(`/department/${dept.toLowerCase()}`);
  };

  const navItems = useMemo(() => {
    const items = [
      { label: "Dashboard", path: "/dashboard", icon: "duo-icons:dashboard" },
      ...SideHeadersList.map((header, idx) => ({
        label: header,
        path: `/${header.toLowerCase()}`,
        icon: icons[idx + 1] || "mingcute:department-fill",
        isDropdown: idx === 1, // Department index
      })),
    ];

    if (isAdmin) {
      items.push({
        label: "Create Account",
        path: "/create-account",
        icon: "mdi:account-plus",
      });
    }

    return items;
  }, [SideHeadersList, icons, isAdmin]);

  return (
    <MotionBox
      initial={false}
      animate={{
        width: sidebarVisible ? "250px" : "70px",
        padding: sidebarVisible ? "20px 10px" : "20px 10px",
      }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      h="calc(100vh - 4rem)" // Matching App Content height
      bg={bgColor}
      boxShadow="xl"
      borderRadius="2xl"
      m="0.5rem 0 0.5rem 0.5rem"
      display="flex"
      flexDirection="column"
      overflowY="auto"
      overflowX="hidden"
      sx={{
        "&::-webkit-scrollbar": { display: "none" },
        msOverflowStyle: "none",
        scrollbarWidth: "none",
      }}
      className="SideBarContainer_Refactored"
      zIndex={100}
    >
      {/* Header / Toggle Button */}
      <Flex
        justify={sidebarVisible ? "space-between" : "center"}
        align="center"
        mb={sidebarVisible ? 2 : 2}
        px={sidebarVisible ? 2 : 0}
      >
        <AnimatePresence mode="wait">
          {sidebarVisible && (
            <motion.div
              key="navigate-text"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <Text
                fontWeight="800"
                fontSize="lg"
                color={textColor}
                letterSpacing="tight"
              >
                NAVIGATE
              </Text>
            </motion.div>
          )}
        </AnimatePresence>
        <IconButton
          icon="mynaui:sidebar-alt"
          onClick={() => setSidebarVisible(!sidebarVisible)}
          size="lg"
          textColor={textColor}
          hoverBg={hoverBg}
        />
      </Flex>

      {/* Nav List */}
      <VStack spacing={2} align="stretch">
        {navItems.map((item, index) => {
          const isActive = location.pathname.includes(item.path);

          if (item.isDropdown) {
            return (
              <Box key={index}>
                <NavItem
                  icon={item.icon}
                  label={item.label}
                  onClick={() => {
                    if (!sidebarVisible) setSidebarVisible(true);
                    setDropdownOpen(!dropdownOpen);
                  }}
                  sidebarVisible={sidebarVisible}
                  textColor={textColor}
                  activeBg={activeBg}
                  hoverBg={hoverBg}
                  glassEffect={glassEffect}
                  isDropdown
                  isOpen={dropdownOpen}
                  isActive={isActive || dropdownOpen}
                />
                <Collapse in={dropdownOpen && sidebarVisible}>
                  <VStack
                    align="stretch"
                    pl={sidebarVisible ? 6 : 0}
                    mt={1}
                    spacing={1}
                  >
                    {filteredDepartments.map((dept, subIdx) => (
                      <Box
                        key={subIdx}
                        py={2}
                        px={4}
                        borderRadius="md"
                        cursor="pointer"
                        fontSize="xs"
                        fontWeight="600"
                        transition="all 0.2s"
                        color={textColor}
                        _hover={{
                          bg: hoverBg,
                          color: "white",
                          transform: "translateX(4px)",
                        }}
                        onClick={() => handleDepartment(dept)}
                      >
                        <Flex align="center">
                          <Icon icon="bi:dot" fontSize="18px" />
                          <Text ml={1}>{dept}</Text>
                        </Flex>
                      </Box>
                    ))}
                  </VStack>
                </Collapse>
              </Box>
            );
          }

          return (
            <NavItem
              key={index}
              icon={item.icon}
              label={item.label}
              isActive={isActive}
              onClick={() => navigate(item.path)}
              sidebarVisible={sidebarVisible}
              textColor={textColor}
              activeBg={activeBg}
              hoverBg={hoverBg}
              glassEffect={glassEffect}
            />
          );
        })}
      </VStack>
    </MotionBox>
  );
}

// Sub-component for individual items to keep things clean
const NavItem = ({
  icon,
  label,
  isActive,
  onClick,
  sidebarVisible,
  isDropdown,
  isOpen,
  textColor,
  activeBg,
  hoverBg,
  glassEffect,
}) => {
  const content = (
    <Flex
      onClick={onClick}
      align="center"
      justify={sidebarVisible ? "flex-start" : "center"}
      p={1}
      borderRadius="3xl"
      cursor="pointer"
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      bg={isActive && !isDropdown ? activeBg : "transparent"}
      {...(isActive && !isDropdown ? glassEffect : {})}
      color={isActive ? "white" : textColor}
      _hover={{
        bg: hoverBg,
        color: "white",
        transform: sidebarVisible ? "translateX(4px)" : "none",
      }}
      position="relative"
      width="100%"
    >
      {/* {isActive && !isDropdown && (
                <Box 
                    position="absolute" 
                    left={sidebarVisible ? "0" : "5px"}
                    width="4px" 
                    height="95%" 
                    bg="white" 
                    borderRadius="full" 
                    boxShadow="0 0 10px rgba(255,255,255,0.5)"
                />
            )} */}

      <Box
        fontSize="22px"
        display="flex"
        align="center"
        justify="center"
        minW="40px"
        ml={sidebarVisible ? 0 : 1}
        // bg={isActive && !isDropdown ? 'whiteAlpha.300' : 'transparent'}
        borderRadius="lg"
        p={1.5}
        transition="all 0.2s"
      >
        <Icon icon={icon} />
      </Box>

      <AnimatePresence>
        {sidebarVisible && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            style={{ overflow: "hidden", whiteSpace: "nowrap" }}
          >
            <Flex align="center" justify="space-between" w="100%" ml={3}>
              <Text fontWeight="bold" fontSize="sm">
                {label}
              </Text>
              {isDropdown && (
                <Box
                  transition="transform 0.2s"
                  transform={isOpen ? "rotate(180deg)" : "none"}
                >
                  <Icon icon="heroicons:chevron-down-20-solid" />
                </Box>
              )}
            </Flex>
          </motion.div>
        )}
      </AnimatePresence>
    </Flex>
  );

  if (!sidebarVisible) {
    return (
      <Tooltip
        label={label}
        placement="right"
        hasArrow
        bg="gray.900"
        color="white"
        px={3}
        py={2}
        borderRadius="md"
        fontSize="xs"
        boxShadow="dark-lg"
      >
        {content}
      </Tooltip>
    );
  }

  return content;
};

const IconButton = ({ icon, onClick, size = "md", textColor, hoverBg }) => {
  return (
    <Box
      onClick={onClick}
      p={2}
      borderRadius="full"
      cursor="pointer"
      transition="all 0.2s"
      _hover={{ bg: hoverBg, transform: "scale(1.1)" }}
      display="flex"
      alignItems="center"
      justifyContent="center"
      color={textColor}
    >
      <Icon icon={icon} fontSize={size === "lg" ? "24px" : "20px"} />
    </Box>
  );
};

export default SideBar;
