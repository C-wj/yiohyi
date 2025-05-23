<template>
  <div class="menu-container">
    <div class="filter-container">
      <el-button type="primary" @click="handleAdd">新增菜单</el-button>
    </div>
    
    <el-table
      v-loading="loading"
      :data="menuList"
      row-key="id"
      :tree-props="{ children: 'children' }"
      style="width: 100%"
    >
      <el-table-column prop="name" label="菜单名称" />
      <el-table-column prop="icon" label="图标">
        <template #default="scope">
          <svg-icon v-if="scope.row.icon" :icon-class="scope.row.icon" />
        </template>
      </el-table-column>
      <el-table-column prop="path" label="路由地址" />
      <el-table-column prop="component" label="组件路径" />
      <el-table-column prop="sort" label="排序" width="80" />
      <el-table-column label="类型" width="80">
        <template #default="scope">
          <el-tag v-if="scope.row.type === 'menu'">菜单</el-tag>
          <el-tag v-else-if="scope.row.type === 'button'" type="warning">按钮</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="可见" width="80">
        <template #default="scope">
          <el-tag v-if="scope.row.visible" type="success">显示</el-tag>
          <el-tag v-else type="info">隐藏</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button v-if="checkPermission(['super_admin'])" type="primary" link @click="handleAdd(scope.row)">新增</el-button>
          <el-button v-if="checkPermission(['super_admin'])" type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
          <el-button v-if="checkPermission(['super_admin'])" type="danger" link @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 菜单表单对话框 -->
    <el-dialog 
      v-model="dialog.visible"
      :title="dialog.title"
      width="600px"
      append-to-body
    >
      <el-form 
        ref="menuFormRef" 
        :model="menuForm"
        :rules="menuRules"
        label-width="100px"
      >
        <el-form-item label="上级菜单">
          <el-tree-select
            v-model="menuForm.parent_id"
            :data="menuOptions"
            :props="{ label: 'name', children: 'children', value: 'id' }"
            value-key="id"
            placeholder="请选择上级菜单"
            check-strictly
            clearable
          />
        </el-form-item>
        <el-form-item label="菜单类型" prop="type">
          <el-radio-group v-model="menuForm.type">
            <el-radio label="menu">菜单</el-radio>
            <el-radio label="button">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="menuForm.name" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="菜单图标" prop="icon" v-if="menuForm.type === 'menu'">
          <el-input v-model="menuForm.icon" placeholder="请输入菜单图标" />
        </el-form-item>
        <el-form-item label="路由地址" prop="path" v-if="menuForm.type === 'menu'">
          <el-input v-model="menuForm.path" placeholder="请输入路由地址" />
        </el-form-item>
        <el-form-item label="组件路径" prop="component" v-if="menuForm.type === 'menu'">
          <el-input v-model="menuForm.component" placeholder="请输入组件路径" />
        </el-form-item>
        <el-form-item label="权限标识" prop="permission">
          <el-input v-model="menuForm.permission" placeholder="请输入权限标识" />
        </el-form-item>
        <el-form-item label="菜单排序" prop="sort">
          <el-input-number v-model="menuForm.sort" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="菜单状态" prop="status">
          <el-radio-group v-model="menuForm.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否可见" prop="visible" v-if="menuForm.type === 'menu'">
          <el-radio-group v-model="menuForm.visible">
            <el-radio :label="true">显示</el-radio>
            <el-radio :label="false">隐藏</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import SystemService from '@/api/system';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

// 菜单列表
const menuList = ref([]);
const menuOptions = ref([]);
const loading = ref(false);

// 表单相关
const menuFormRef = ref(null);
const menuForm = reactive({
  name: '',
  icon: '',
  path: '',
  component: '',
  parent_id: null,
  sort: 0,
  type: 'menu',
  permission: '',
  visible: true,
  status: 1
});
const menuRules = {
  name: [{ required: true, message: '菜单名称不能为空', trigger: 'blur' }],
  path: [{ required: true, message: '路由地址不能为空', trigger: 'blur' }],
  type: [{ required: true, message: '菜单类型不能为空', trigger: 'change' }]
};
const dialog = reactive({
  visible: false,
  title: '添加菜单'
});

// 初始化
onMounted(() => {
  getMenuList();
});

// 获取菜单列表
const getMenuList = async () => {
  loading.value = true;
  try {
    const res = await SystemService.getMenus();
    if (res.code === 0) {
      menuList.value = res.data || [];
      menuOptions.value = [{ id: null, name: '主目录', children: res.data || [] }];
    }
  } catch (error) {
    console.error('获取菜单列表失败', error);
    ElMessage.error('获取菜单列表失败');
  } finally {
    loading.value = false;
  }
};

// 新增菜单
const handleAdd = (row) => {
  resetForm();
  dialog.title = '添加菜单';
  dialog.visible = true;
  
  if (row && row.id) {
    menuForm.parent_id = row.id;
  }
};

// 编辑菜单
const handleEdit = (row) => {
  resetForm();
  dialog.title = '编辑菜单';
  dialog.visible = true;
  nextTick(() => {
    menuForm.id = row.id;
    menuForm.name = row.name;
    menuForm.icon = row.icon;
    menuForm.path = row.path;
    menuForm.component = row.component;
    menuForm.parent_id = row.parent_id;
    menuForm.sort = row.sort;
    menuForm.type = row.type;
    menuForm.permission = row.permission;
    menuForm.visible = row.visible;
    menuForm.status = row.status;
  });
};

// 删除菜单
const handleDelete = (row) => {
  if (row.children && row.children.length > 0) {
    ElMessage.warning('存在子菜单，不允许删除');
    return;
  }
  
  ElMessageBox.confirm(`确定删除菜单"${row.name}"吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await SystemService.deleteMenu(row.id);
      if (res.code === 0) {
        ElMessage.success('删除成功');
        getMenuList();
      }
    } catch (error) {
      console.error('删除菜单失败', error);
      ElMessage.error('删除菜单失败');
    }
  });
};

// 提交表单
const submitForm = async () => {
  menuFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (menuForm.id) {
          // 更新菜单
          const res = await SystemService.updateMenu(menuForm.id, menuForm);
          if (res.code === 0) {
            ElMessage.success('更新成功');
            dialog.visible = false;
            getMenuList();
          }
        } else {
          // 创建菜单
          const res = await SystemService.createMenu(menuForm);
          if (res.code === 0) {
            ElMessage.success('创建成功');
            dialog.visible = false;
            getMenuList();
          }
        }
      } catch (error) {
        console.error('保存菜单失败', error);
        ElMessage.error('保存菜单失败');
      }
    }
  });
};

// 重置表单
const resetForm = () => {
  if (menuFormRef.value) {
    menuFormRef.value.resetFields();
  }
  menuForm.id = undefined;
  menuForm.name = '';
  menuForm.icon = '';
  menuForm.path = '';
  menuForm.component = '';
  menuForm.parent_id = null;
  menuForm.sort = 0;
  menuForm.type = 'menu';
  menuForm.permission = '';
  menuForm.visible = true;
  menuForm.status = 1;
};

// 检查权限
const checkPermission = (roles) => {
  const userRole = userStore.userInfo?.role || 'user';
  return roles.includes(userRole);
};
</script>

<style scoped>
.menu-container {
  padding: 20px;
}
.filter-container {
  margin-bottom: 20px;
}
</style> 