<template>
  <a-dropdown v-if="user && user.nickName">
    <div class="header-avatar" style="cursor: pointer">
      <a-avatar class="avatar" size="small" shape="circle" :src="user.avatar" />
      <span class="name">{{ user.nickName }}</span>
    </div>
    <a-menu :class="['avatar-menu']" slot="overlay">
      <!-- <a-menu-item>
        <a-icon type="user" />
        <span>个人中心</span>
      </a-menu-item>
      <a-menu-item>
        <a-icon type="setting" />
        <span>设置</span>
      </a-menu-item> -->
      <!-- <a-menu-divider /> -->
      <a-menu-item @click="logout">
        <a-icon style="margin-right: 8px" type="poweroff" />
        <span>退出登录</span>
      </a-menu-item>
    </a-menu>
  </a-dropdown>
  <span v-else>
    <a-spin size="small" />
  </span>
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
      const _this = this
      _this.$confirm({
        title: '信息',
        content: '您确定要退出登录吗？',
        onOk() {
          return new Promise((resolve, reject) => {
            logout()
              .then(() => {
                setTimeout(() => {
                  storage.remove(process.env.VUE_APP_ROUTES_KEY)
                  storage.remove(process.env.VUE_APP_USER_KEY)
                  storage.remove(process.env.VUE_APP_ROLES_KEY)
                  storage.remove(ACCESS_TOKEN)
                  _this.setMenuData([])
                  _this.$router.push(LOGIN_PATH)
                  resolve()
                }, 1000)
              })
              .catch((err) => reject(err))
          }).catch(() => {
            console.log('Oops errors!')
          })
        },
        onCancel() {}
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
