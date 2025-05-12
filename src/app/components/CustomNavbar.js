"use client";

import React, { useState } from "react";
import { LightBulbIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import Image from "next/image";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import { signIn, signOut, useSession } from "next-auth/react";

const CustomNavbar = ({ decodedToken, setDecodedToken, adminUsers }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { data: session, status } = useSession();
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    setLoading(true);
    await signOut();
    setLoading(false);
    setOpenLogoutDialog(false);
  };

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/dashboard", auth: true },
    { label: "Admin Centre", href: "/admin", admin: true },
  ];

  const drawer = (
    <div className="bg-[#34577E] h-full">
      <div className="p-4">
        <Image
          src="https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=150&h=50&fit=crop&crop=edges"
          alt="WattWise Logo"
          width={150}
          height={50}
          className="object-cover"
        />
      </div>
      <List>
        {navItems.map(
          (item) =>
            ((item.auth && decodedToken) ||
              (!item.auth && !item.admin) ||
              (item.admin &&
                decodedToken &&
                adminUsers.includes(decodedToken.email))) && (
              <ListItem
                button
                key={item.label}
                component={Link}
                href={item.href}
              >
                <ListItemText
                  primary={item.label}
                  className="text-[#B8DBD9] hover:text-white transition duration-300"
                />
              </ListItem>
            )
        )}
      </List>
    </div>
  );

  return (
    <AppBar
      position="static"
      className="bg-[#34577E] rounded-b-lg shadow-lg border-b-4 border-[#507DBC]"
    >
      <Toolbar>
        <div>
          {status === 'authenticated' ? (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setOpenLogoutDialog(true)}
              >
                Logout
              </Button>
              <Dialog
                open={openLogoutDialog}
                onClose={() => setOpenLogoutDialog(false)}
              >
                <DialogTitle>Confirm Logout</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Are you sure you want to logout?
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setOpenLogoutDialog(false)} color="primary">
                    Cancel
                  </Button>
                  <Button onClick={handleLogout} color="primary" autoFocus>
                    {loading ? <CircularProgress size={24} /> : 'Logout'}
                  </Button>
                </DialogActions>
              </Dialog>
            </>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={() => signIn("google")}
            >
              Sign in with Google
            </Button>
          )}
        </div>
      </Toolbar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        className="w-64"
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default CustomNavbar;
