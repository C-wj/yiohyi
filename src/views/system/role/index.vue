<template>
  <!-- Add your template code here -->
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useSystemService } from '@/services/system';
import { useUserStore } from '@/stores/user';

const SystemService = useSystemService();
const userStore = useUserStore();

const roleFormRef = ref(null);
const roleForm = ref({
  id: undefined,
  name: '',
  code: '',
  description: '',
  status: 1
});
const dialog = ref({
  visible: false
});
const menuTreeRef = ref(null);
const permissionDialog = ref({
  visible: false,
  roleId: undefined
});

// 获取角色列表
const getRoleList = async () => {
  // Implement the logic to fetch role list
};

// 更新角色
const updateRole = async () => {
  try {
    if (roleForm.value.id) {
      // 更新角色
      const res = await SystemService.updateRole(roleForm.value.id, roleForm.value);
      if (res.code === 0) {
        ElMessage.success('更新成功');
        dialog.value.visible = false;
        getRoleList();
      }
    } else {
      // 创建角色
      const res = await SystemService.createRole(roleForm.value);
      if (res.code === 0) {
        ElMessage.success('创建成功');
        dialog.value.visible = false;
        getRoleList();
      }
    }
  } catch (error) {
    console.error('保存角色失败', error);
    ElMessage.error('保存角色失败');
  }
};

// 提交权限
const submitPermission = async () => {
  const menuIds = menuTreeRef.value.getCheckedKeys();
  try {
    const res = await SystemService.updateRole(permissionDialog.value.roleId, {
      menus: menuIds
    });
    if (res.code === 0) {
      ElMessage.success('权限分配成功');
      permissionDialog.value.visible = false;
      getRoleList();
    }
  } catch (error) {
    console.error('权限分配失败', error);
    ElMessage.error('权限分配失败');
  }
};

// 重置表单
const resetForm = () => {
  if (roleFormRef.value) {
    roleFormRef.value.resetFields();
  }
  roleForm.value.id = undefined;
  roleForm.value.name = '';
  roleForm.value.code = '';
  roleForm.value.description = '';
  roleForm.value.status = 1;
};

// 检查权限
const checkPermission = (roles) => {
  const userRole = userStore.userInfo?.role || 'user';
  return roles.includes(userRole);
};
</script>

<style scoped>
.role-container {
  padding: 20px;
}
.filter-container {
  margin-bottom: 20px;
}
</style> 