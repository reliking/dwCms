<template>
    <div class="app-container">
        <div class="filter-container">
            <el-button type="primary" icon="el-icon-search" @click="addSysBankFun">添加广告</el-button>
            <el-input v-model="listQuery.type" placeholder="银行名称" style="width:200px;"></el-input>
            <el-button type="primary" icon="el-icon-search" @click="serchFun">查找</el-button>
            <el-button style="margin-left: 10px;" @click="reSearchFun" type="primary" icon="el-icon-edit">重置</el-button>
        </div>
        <el-table :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row style="width: 100%">
            <el-table-column align="center" label="Id" prop="id" width="60"></el-table-column>
            <el-table-column align="center" label="名称" prop="title" width="200"></el-table-column>
            <el-table-column align="center" label="类型" width="160">
                <template slot-scope="scope">
                    <span v-if="scope.row.type == 1">首页上部轮播</span>
                    <span v-else-if="scope.row.type == 2">首页中部视频广告</span>
                    <span v-else-if="scope.row.type == 3">首页左边栏广告</span>
                    <span v-else-if="scope.row.type == 4">首页背景</span>
                    <span v-else>未知</span>
                </template>
            </el-table-column>
            <el-table-column align="center" label="图片地址" width="200">
                <template slot-scope="scope">
                    <img :src="scope.row.img_url" style="height: 25px;">
                </template>
            </el-table-column>
            <el-table-column align="center" label="连接url" prop="href"></el-table-column>
            <el-table-column align="center" label="新窗打开" width="100">
                <template slot-scope="scope">
                    <span v-if="scope.row.open_new_window == 1">是</span>
                    <span v-else>否</span>
                </template>
            </el-table-column>
            <el-table-column align="center" label="状态" width="100">
                <template slot-scope="scope">
                    <span v-if="scope.row.is_show == 1">正常</span>
                    <span v-else>隐藏</span>
                </template>
            </el-table-column>
            <el-table-column align="center" label="添加人" prop="admin_user_name" width="120"></el-table-column>
            <el-table-column align="center" label="操作" class-name="small-padding fixed-width" width="120">
                <template slot-scope="scope">
                    <span @click="editSysFun(scope.row)">修改</span> | 
                    <span @click="delPayFun(scope.row.id)">删除</span>
                </template>
            </el-table-column>
        </el-table>
        <!--<div class="pagination-container">
            <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listQuery.page_no" :page-sizes="[10,20,30, 50]" :page-size="listQuery.page_size" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </div>-->
        <el-dialog :title="isAdd ? '添加广告':'修改广告信息'" :visible.sync="editSysFormVisible" width="600px">
            <el-form :rules="editSysFormRules" ref="editSysForm" :model="editSysForm" label-position="left" label-width="120px" style='width: 500px; margin-left:50px;'>
                <el-form-item label="广告类别" prop="type">
                    <el-select v-model="editSysForm.type" placeholder="请选择">
                        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="广告名称" prop="title">
                    <el-input v-model="editSysForm.title"></el-input>
                </el-form-item>
                <el-form-item label="广告图片" prop="img_url">
                    <el-input v-model="editSysForm.img_url"></el-input>
                </el-form-item>
                <el-form-item label="连接地址" prop="href">
                    <el-input v-model="editSysForm.home_url"></el-input>
                </el-form-item>
                <el-form-item label="在新窗口打开" prop="open_new_window">
                    <el-radio v-model="editSysForm.open_new_window" label="1">是</el-radio>
                    <el-radio v-model="editSysForm.open_new_window" label="0">否</el-radio>
                </el-form-item>
                <el-form-item label="排序" prop="sort">
                    <el-input v-model="editSysForm.sort"></el-input>
                </el-form-item>
                <el-form-item label="是否显示" prop="is_show">
                    <el-radio v-model="editSysForm.is_show" label="1">是</el-radio>
                    <el-radio v-model="editSysForm.is_show" label="0">否</el-radio>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="editSysFormVisible = false">取消</el-button>
                <el-button type="primary" :loading="btnLoading" @click="submitEditSysFun">确认</el-button>
            </div>
        </el-dialog>
        
        
        <el-upload
  class="upload-demo"
  ref="upload"
  action="http://teni2.123nat.com:9621/huaxia_uploader.ashx?action=uploadimage"
  :on-preview="handlePreview"
  :on-remove="handleRemove"
  :file-list="fileList"
  :auto-upload="false">
  <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
  <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>
  <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
</el-upload>
        
    </div>
</template>
<script>
    import { Message } from 'element-ui'
    import { getBannerListApi,addBannerApi, editBannerApi, delBannerApi  } from '@/api/system'
    export default {
        name: 'PresentRecord',
        data() {
            return {
                fileList: [
                    {name: 'food.jpeg', url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100'},
                    {name: 'food2.jpeg', url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100'}
                ],
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
                    id: '',
                    title: '',
                    img_url: '',
                    href: '',
                    open_new_window: '',
                    sort: '',
                    is_show: '',
                    type: '',
                },
                editSysFormRules: {
                    title: [{ required: true, trigger: 'blur', message:'名称不能为空'}],
                    img_url: [{ required: true, trigger: 'blur', message:'图片地址不能为空' }],
                    type: [{ required: true, trigger: 'blur', message:'类型不能为空'  }],
                },
            }
        },
        filters: {
            
        },
        created() {
            this.getList()
        },
        methods: {
            getList() {
                this.listLoading = true
                getBannerListApi(this.listQuery).then(response => {
                    console.log(JSON.stringify(response))
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
            addSysBankFun(){
                this.isAdd = true;
                this.editSysForm = {
                    id: '',
                    title: '',
                    img_url: '',
                    href: '',
                    open_new_window: '0',
                    sort: '0',
                    is_show: '1',
                    type: '1',
                }
                this.editSysFormVisible = true;
            },
            editSysFun(itemS){
                this.editSysForm = {
                    id: itemS.id,
                    title: itemS.title,
                    img_url: itemS.img_url,
                    href: itemS.href,
                    open_new_window: itemS.open_new_window+'',
                    sort: itemS.sort,
                    is_show: itemS.is_show+'',
                    type: itemS.type+'',
                },
                this.editSysFormVisible = true;
            },
            submitEditSysFun(){
                this.$refs.editSysForm.validate(valid => {
                    if(valid) {
                        this.editSysForm.sort = parseInt(this.editSysForm.sort);
                        console.log(JSON.stringify(this.editSysForm));
                        if(this.isAdd){
                            addBannerApi(this.editSysForm).then(response => {
                                console.log(JSON.stringify(response))
                                Message({
                                    message: '添加成功',
                                    type: 'success',
                                    duration: 3 * 1000
                                })
                                this.editSysFormVisible = false;
                                this.getList();
                                this.btnLoading = false
                                this.isAdd = false;
                            }).catch(res => {
                                console.log(JSON.stringify(res))
                                Message({
                                    message: '添加失败',
                                    type: 'error',
                                    duration: 3 * 1000
                                })
                                this.btnLoading = false;
                                this.isAdd = false;
                            });
                        }else{
                            editBannerApi(this.editSysForm).then(response => {
                                console.log(JSON.stringify(response))
                                Message({
                                    message: '修改成功',
                                    type: 'success',
                                    duration: 3 * 1000
                                })
                                this.editSysFormVisible = false;
                                this.getList();
                                this.btnLoading = false
                            }).catch(res => {
                                console.log(JSON.stringify(res))
                                Message({
                                    message: '修改失败',
                                    type: 'error',
                                    duration: 3 * 1000
                                })
                                this.btnLoading = false;
                            });
                        }
                        
                    } else {
                        Message({
                            message: '请填写好相应项，才能发公告！',
                            type: 'error',
                            duration: 2 * 1000
                        })
                        console.log('error submit!!')
                        return false
                    }
                });
            },
            delPayFun(nId){
                console.log(nId);
                if(!nId) return;
                nId = parseInt(nId);
                this.$confirm('确认要删除？').then(_ => {
                    delBannerApi({id:nId}).then(response => {
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
            submitUpload() {
        this.$refs.upload.submit();
      },
      handleRemove(file, fileList) {
        console.log(file, fileList);
      },
      handlePreview(file) {
        console.log(file);
      }
        },
    }
</script>