<template>
  <a-dropdown>
    <div class="header-avatar" style="cursor: pointer">
      <a-avatar class="avatar" size="small" shape="circle" :src="user.avatar" />
      <span class="name">{{ user.name }}</span>
    </div>
    <a-menu :class="['avatar-menu']" slot="overlay">
      <a-menu-item>
        <a-icon type="user" />
        <span>个人中心</span>
      </a-menu-item>
      <a-menu-item>
        <a-icon type="setting" />
        <span>设置</span>
      </a-menu-item>
      <a-menu-divider />
      <a-menu-item @click="logout">
        <a-icon style="margin-right: 8px" type="poweroff" />
        <span>退出登录</span>
      </a-menu-item>
    </a-menu>
  </a-dropdown>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { logout } from '@/services/user'
import { LOGIN_PATH } from '@/router'
import { ACCESS_TOKEN } from '@/utils/request'
import storage from 'store'

export default {
  name: 'HeaderAvatar',
  computed: {
    ...mapGetters('account', ['user'])
  },
  methods: {
    logout() {
      logout().then(() => {
        storage.remove(process.env.VUE_APP_ROUTES_KEY)
        storage.remove(process.env.VUE_APP_USER_KEY)
        storage.remove(process.env.VUE_APP_ROLES_KEY)
        storage.remove(ACCESS_TOKEN)
        this.setMenuData([])
        setTimeout(() => {
          this.$router.push(LOGIN_PATH)
        }, 1000)
      })
    },
    ...mapMutations('setting', ['setMenuData'])
  }
}
</script>

<style lang="less">
.header-avatar {
  display: inline-flex;
  .avatar,
  .name {
    align-self: center;
  }
  .avatar {
    margin-right: 8px;
  }
  .name {
    font-weight: 500;
  }
}
.avatar-menu {
  width: 150px;
}
</style>
