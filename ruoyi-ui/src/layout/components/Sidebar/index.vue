<template>
    <div :class="{'has-logo':showLogo}" :style="{ backgroundColor: 'var(--menu-background)' }">
        <logo v-if="showLogo" :collapse="isCollapse" />
        <el-scrollbar :class="settings.themeMode" wrap-class="scrollbar-wrapper">
            <el-menu
                :default-active="activeMenu"
                :collapse="isCollapse"
                background-color="var(--menu-background)"
                text-color="var(--menu-color)"          
                :unique-opened="true"
                active-text-color="var(--menu-color-active)"
                :collapse-transition="false"
                mode="vertical"
            >
                <sidebar-item
                    v-for="(route, index) in sidebarRouters"
                    :key="route.path  + index"
                    :item="route"
                    :base-path="route.path"
                />
            </el-menu>
        </el-scrollbar>
    </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import Logo from "./Logo";
import SidebarItem from "./SidebarItem";
export default {
    components: { SidebarItem, Logo },
    computed: {
        ...mapState(["settings"]),
        ...mapGetters(["sidebarRouters", "sidebar"]),
        activeMenu() {
            const route = this.$route;
            const { meta, path } = route;
            // if set path, the sidebar will highlight the path you set
            if (meta.activeMenu) {
                return meta.activeMenu;
            }
            return path;
        },
        showLogo() {
            return this.$store.state.settings.sidebarLogo;
        },
        isCollapse() {
            return !this.sidebar.opened;
        }
    }
};
</script>
