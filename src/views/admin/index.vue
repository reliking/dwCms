<template>
    <div class="app-container">
        <div class="filter-container">
            <el-button type="primary" icon="el-icon-search" @click="editFormFun()">添加用户</el-button>
            <el-input v-model="listQuery.type" placeholder="用户名称" style="width:200px;"></el-input>
            <el-button type="primary" icon="el-icon-search" @click="serchFun">查找</el-button>
            <el-button style="margin-left: 10px;" @click="reSearchFun" type="primary" icon="el-icon-edit">重置</el-button>
        </div>
        <el-table :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row style="width: 100%">
            <el-table-column label="Id" width="80" prop="admin_id"></el-table-column>
            <el-table-column label="用户名" width="100" prop="user_name"></el-table-column>
            <el-table-column label="状态" prop="status"></el-table-column>
            <el-table-column label="用户组" prop="group_id"></el-table-column>
            <el-table-column label="真实姓名" width="100" prop="true_name"></el-table-column>
            <el-table-column label="手机号" prop="telephone"></el-table-column>
            <el-table-column label="邮箱" prop="email"></el-table-column>
            <el-table-column label="最后登录ip" prop="last_login_ip"></el-table-column>
            
            <el-table-column align="center" label="操作" width="160">
                <template slot-scope="scope">
                    <span @click="editFormFun(scope.row)">编辑</span> ｜ 
                    <span @click="delPayFun(scope.row.admin_id)">删除</span> ｜ 
                    <span>权限</span>
                </template>
            </el-table-column>
        </el-table>
        <!--<div class="pagination-container">
            <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listQuery.page_no" :page-sizes="[10,20,30, 50]" :page-size="listQuery.page_size" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </div>-->
        <!--<el-dialog :title="isAdd ? '添加管理员':'修改管理员'" :visible.sync="editSysFormVisible" width="600px">
            <el-form :rules="editSysFormRules" ref="editSysForm" :model="editSysForm" label-position="left" label-width="120px" style='width: 500px; margin-left:50px;'>
                <el-form-item label="用户组" prop="group_id">
                    <el-select v-model="editSysForm.group_id" placeholder="请选择">
                        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="状态" prop="status">
                    <el-radio v-model="editSysForm.status" label="1">正常</el-radio>
                    <el-radio v-model="editSysForm.status" label="0">锁定</el-radio>
                </el-form-item>
                <el-form-item label="用户名" prop="user_name">
                    <el-input v-model="editSysForm.user_name" placeholder="请输入用户名"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="passwd">
                    <el-input v-model="editSysForm.passwd" placeholder="请输入密码"></el-input>
                </el-form-item>
                <el-form-item label="真实姓名" prop="true_name">
                    <el-input v-model="editSysForm.true_name" placeholder="请输入真实姓名"></el-input>
                </el-form-item>
                <el-form-item label="手机号码" prop="telephone">
                    <el-input v-model="editSysForm.telephone" placeholder="请输入手机号"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editSysForm.email" placeholder="请输入邮箱"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="editSysFormVisible = false">取消</el-button>
                <el-button type="primary" :loading="btnLoading" @click="submitEditSysFun">确认</el-button>
            </div>
        </el-dialog>-->
        
        <transition name="fade-transform" mode="out-in">
            <edit-form v-show="editFormVisible" :jsonId="jsonID" @closeEditForm="(statsT)=>{editFormVisible = statsT; getList();}">
            </edit-form>
        </transition>
        
    </div>
</template>
<script>
    import { Message } from 'element-ui'
    import { getAdminListApi, addAdminApi,delAdminApi } from '@/api/admin'
    //import { checkForm } from '@/filters/form'
    import { checkForm } from '@/filters/validatorForm'
    
    import editForm from './components/editForm'
    export default {
        name: 'PresentRecord',
        data() {
            return {
                editFormVisible:false,
                jsonID:'',
                tableKey: 0,
                list: null,
                total: null,
                listLoading: true,
                listQuery: {
                    'type': '',
                    'page_no': 1,
                    'page_size': 10,
                    'order_by': [{
                        'order_field': 'id',
                        'order_value': 'desc'
                    }],
                },
                options:[
                    {label:'首页上部轮播',value:'1'},
                    {label:'首页中部视频广告',value:'2'},
                    {label:'首页左边栏广告',value:'3'},
                    {label:'首页背景',value:'4'}
                ],
                btnLoading:false,
                editSysFormVisible:false,
                isAdd:false,
                editSysForm:{
                    admin_id: '',
                    user_name: '',
                    passwd: '',
                    status: '',
                    true_name: '',
                    telephone:'',
                    email:'',
                },
                editSysFormRules: {
                    //user_name: [{ required: true, trigger: 'blur', message:'不能为空'}],
                    user_name: [{ required: true, type:'name', trigger: 'blur', validator:checkForm}],
                    passwd: [{ required: false, type:'pwd', trigger: 'blur', validator:checkForm}],
                },
            }
        },
        filters: {
            
        },
        created() {
            this.getList();
        },
        components:{
            editForm
        },
        methods: {
            getList() {
                this.listLoading = true
                getAdminListApi(this.listQuery).then(response => {
                    //console.log(JSON.stringify(response))
                    this.list = response.data
                    this.total = response.record_total;
                    this.listLoading = false
                }).catch(res => {
                    console.log(JSON.stringify(res))
                    this.listLoading = false;
                });
            },
            handleSizeChange(val) {
                this.listQuery.page_size = val;
                this.getList()
            },
            handleCurrentChange(val) {
                this.listQuery.page_no = val;
                this.getList()
            },
            serchFun(){
                this.listQuery.page_no = 1;
                this.getList();
            },
            reSearchFun(){
                this.listQuery = {
                    'way_name': '',
                    'page_no': 1,
                    'page_size': 10,
                    'order_by': [{
                        'order_field': 'id',
                        'order_value': 'desc'
                    }],
                }
                this.getList();
            },
            editFormFun(itemS){
                if(itemS){
                    this.jsonID = itemS;
                }else{ 
                    this.jsonID == '' ? this.jsonID = 0 : this.jsonID = '';
                }
                this.editFormVisible = true;
            },
            delPayFun(nId){
                console.log(nId);
                if(!nId) return;
                nId = parseInt(nId);
                this.$confirm('确认要删除？').then(_ => {
                    delAdminApi({admin_id:nId}).then(response => {
                        console.log(JSON.stringify(response));
                        Message({
                            message: '删除成功！',
                            type: 'success',
                            duration: 2 * 1000
                        })
                        this.getList();
                    }).catch(res => {
                        console.log(11111)
                        console.log(JSON.stringify(res))
                        this.listLoading = false;
                    })
                    return false;
                }).catch(res=> {
                    console.log(1111111);
                });
            },
        },
    }
</script>

<style>
.app-main{ position: relative;}
</style>