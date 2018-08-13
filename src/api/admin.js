import request from '@/utils/request'

export function getAdminListApi() {
    return request({
        url: '/admin/admin/index',
        method: 'post',
        
    })
}


export function addAdminApi(data) {
    return request({
        url: '/admin/admin/add',
        method: 'post',
        data
    })
}

export function delAdminApi(data) {
    return request({
        url: '/admin/admin/del',
        method: 'post',
        data
    })
}
