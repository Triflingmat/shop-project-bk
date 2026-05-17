<template>
  <h3 style="margin-top: -10px;">主页控制台</h3>
  <div class="dashboard-grid">
    <!-- 统计卡片 -->
    <div class="card stat-card">
      <div style="display: flex;justify-content:center;"><el-statistic title="总用户量" :value="userValue" /></div>
      <hr class="line">
      <div style="display: flex;justify-content: space-between;"><h4>总用户量</h4><h4>{{ userData.length }}</h4></div>
    </div>
    <div class="card stat-card">
      <div style="display: flex;justify-content:center;"><el-statistic title="总订单量" :value="orderValue" /></div>
      <hr class="line">
      <div style="display: flex;justify-content: space-between;"><h4>转化率</h4><h4>{{ transform.toFixed(2) }}%</h4></div>
    </div>
    <div class="card stat-card">
      <div style="display: flex;justify-content:center;"><el-statistic title="总销售额" :value="revenueValue" /></div>
      <hr class="line">
      <div style="display: flex;justify-content: space-between;"><h4>已支付订单</h4><h4>{{ finshedOrder+pendingOrder }}</h4></div>
    </div>
    <div class="card stat-card">
      <div style="display: flex;justify-content:center;"><el-statistic title="总商品量" :value="goodsValue" /></div>
      <hr class="line">
      <div style="display: flex;justify-content: space-between;"><h4>商品类型种类</h4><h4>{{ goodsCategoryData.length }}</h4></div>
    </div>

    <!-- 饼图（左侧，跨两行） -->
    <div class="card chart-center pie-chart" ref="chartRef2"></div>

    <!-- 右侧面板：4个快捷按钮 + 柱状图 -->
    <div class="right-panel">
      <div class="card shortcut-card">
        <button class="btn" @click="UserManage"><el-icon style="font-size: 40px;margin-top: 20px;"><Avatar /></el-icon><h4>用户管理</h4></button>
      </div>
      <div class="card shortcut-card">
        <button class="btn" @click="GoodsManage"><el-icon style="font-size: 40px;margin-top: 20px;"><Sell /></el-icon><h4>商品管理</h4></button>
      </div>
      <div class="card shortcut-card">
        <button class="btn" @click="OrderManage"><el-icon style="font-size: 40px;margin-top: 20px;"><ShoppingCart /></el-icon><h4>订单管理</h4></button>
      </div>
      <div class="card shortcut-card">
        <button class="btn" @click="AftersaleManage"><el-icon style="font-size: 40px;margin-top: 20px;"><Comment /></el-icon><h4>售后管理</h4></button>
      </div>
      <!-- 柱状图 -->
      <div class="card chart-center bar-chart" ref="chartRef"></div>
    </div>
  </div>
</template>

<script lang="ts" setup name="home">
    //JS
import {ref,onMounted} from 'vue'
import router from '@/router/index'
import {Avatar,Sell,ShoppingCart,Comment} from '@element-plus/icons-vue'
import {get} from '@/utils/request';
import type { ChartData } from '@/types';
import { useTransition } from '@vueuse/core'
import { RetrieveData } from '@/utils/crud';
    //ECharts
import * as echarts from 'echarts/core';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components';
import { BarChart,LineChart,PieChart } from 'echarts/charts';
import { UniversalTransition,LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import type {User,Goods} from '@/types'
import { getUserData } from '@/api/user';
import { getGoodsData } from '@/api/goods';
import { getOrderData } from '@/api/order';

const props = defineProps({
  defaultActive: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:default-active'])

function UserManage(){
  emit('update:default-active', '2-2')
  router.push('../userManage')
}
function GoodsManage(){
  emit('update:default-active', '3-1')
  router.push('../goodsManage')
}
function OrderManage(){
  emit('update:default-active', '4-1')
  router.push('../orderManage')
}
function AftersaleManage(){
  emit('update:default-active', '5-1')
  router.push('../aftersaleManage')
}



//echart
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  BarChart,
  CanvasRenderer,
  LineChart,
  UniversalTransition,
  PieChart,
  LabelLayout
]);
const chartRef = ref(null)
const chartRef2 = ref(null)

//获取数据
const totalUsers = ref(0)
const userData =  ref<User[]>([])
const pageNum = ref(1)
const pageSize = ref(9999)
const mode1 = ref(3)
const total = ref(1)
const GetUserData = async ()=>{
  await RetrieveData(
    getUserData,
    userData,
    pageNum,
    pageSize,
    mode1,
    total
  )
  totalUsers.value = userData.value.length
}
const goodsData = ref<Goods[]>([])
const totalGoods = ref(0)
const mode2 = ref(0)
const GetGoodsData = async ()=>{
  await RetrieveData(
    getGoodsData,
    goodsData,
    pageNum,
    pageSize,
    mode2,
    total
  )
  totalGoods.value = goodsData.value.length
}
const orderData = ref<Goods[]>([])
const finshedOrderData = ref<Goods[]>([])
const pendingOrderData = ref<Goods[]>([])
const totalOrder = ref(0)
const finshedOrder = ref(0)
const pendingOrder = ref(0)
const transform = ref(0)
const mode3 = ref(5)
const mode4 = ref(4)
const GetOrderData = async ()=>{
  await RetrieveData(
    getOrderData,
    orderData,
    pageNum,
    pageSize,
    mode2,
    total
  )
  await RetrieveData(
  getOrderData,
  finshedOrderData,
  pageNum,
  pageSize,
  mode3,
  total
  )
  await RetrieveData(
  getOrderData,
  pendingOrderData,
  pageNum,
  pageSize,
  mode4,
  total
  )
  totalOrder.value = orderData.value.length
  finshedOrder.value = finshedOrderData.value.length
  pendingOrder.value = pendingOrderData.value.length
  transform.value = (finshedOrder.value/totalOrder.value)*100
}



onMounted( async ()=>{
  //柱状图
  const myChart = echarts.init(chartRef.value);
  const myChart2 = echarts.init(chartRef2.value)
  await GetOrderCategory()
  await GetGoodsCategory()
  await GetUserData()
  await GetGoodsData()
  await GetOrderData()
  await GetRevenue()
  myChart.setOption ( {
  title: {
    text: '订单统计'
  },
  tooltip: {},
  legend: {
    data: ['订单量']
  },
  xAxis: {
    data: orderCategoryData.value
  },
  yAxis: {
    type:'value'
  },
  series: [
    {
      name: '订单量',
      type: 'bar',
      data: orderCategoryData.value
    }]
  })
  //饼图
  myChart2.setOption({
  title: {
    top: '0%',
    text: '商品分类统计'
  },
  tooltip: {
    trigger: 'item'
  },
  legend: {
    orient: 'vertical',
    left: 'left'
  },
  series: [
    {
      name: '商品统计',
      type: 'pie',
      radius: '50%',
      data: goodsCategoryData.value,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  })
})


const orderCategoryData = ref<ChartData[]>([])
const goodsCategoryData = ref<ChartData[]>([])
const GetOrderCategory = async ()=>{
  const res = await get('order/getCategory')
  orderCategoryData.value = res.data
}
const GetGoodsCategory = async ()=>{
  const res = await get('/category/getCategoryNameCount')
  goodsCategoryData.value = res.data
}
const totalRevenue = ref(0)
const GetRevenue = async ()=>{
  const res = await get('/order_item/getRevenue')
  totalRevenue.value = res.data
}
const userValue = useTransition(totalUsers, {
  duration: 1500,
})
const goodsValue = useTransition(totalGoods, {
  duration: 1500,
})
const orderValue = useTransition(totalOrder, {
  duration: 1500,
})
const revenueValue = useTransition(totalRevenue, {
  duration: 1500,
})
</script>

<style scoped>
    /* ===== Grid 布局 ===== */
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 20px;
    }

    .stat-card {
      grid-column: span 2;
      height: 220px;
    }

    .pie-chart {
      grid-column: span 4;
      grid-row: span 2;
      min-height: 420px;
    }

    /* 右侧面板：嵌套 grid，上半放4个快捷按钮，下半放柱状图 */
    .right-panel {
      grid-column: span 4;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      align-content: start;
    }

    .shortcut-card {
      height: 100px;
      justify-content: center;
      display: flex;
      align-items: center;
    }

    .bar-chart {
      grid-column: span 4;
      height: 235px;
    }

    /* ===== 通用样式 ===== */
    .card{
        background-color: white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        flex-direction: column;
        justify-content: center;
        display: flex;
        padding: 20px;
    }
    .card:hover{
      transform: scale(1.05);
      transition: all 0.5s ease;
    }
    .line{
      width: 100%;
      color: rgb(197, 197, 197);
      margin-top: 20px;
    }
     .chart-center {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .btn{
      background-color: rgba(255, 255, 255, 0);
      border: 0;
    }
    .btn:hover{
      cursor: pointer;
      transform: scale(1.1);
      transition: all 0.3s ease;
    }
    .btn:active{
      transform: scale(0.9);
      transition: all 0.3s ease;
    }
    :deep(.el-statistic) {
      --el-statistic-title-font-size: 20px;
      --el-statistic-content-font-size: 40px;
    }

    /* ===== 移动端媒体查询 ===== */
    @media(max-width: 768px) {
      .dashboard-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }

      .stat-card {
        grid-column: span 1;
        height: auto;
        padding: 10px;
      }

      .pie-chart {
        grid-column: span 2;
        grid-row: auto;
        height: 250px;
      }

      .right-panel {
        grid-column: span 2;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }

      .shortcut-card {
        grid-column: span 1;
        height: 80px;
      }

      .bar-chart {
        grid-column: span 2;
        height: 250px;
      }

      .card {
        padding: 10px;
      }

      .card:hover {
        transform: scale(1.02);
      }

      :deep(.el-statistic) {
        --el-statistic-title-font-size: 14px;
        --el-statistic-content-font-size: 28px;
      }

      h4 {
        font-size: 14px;
      }
    }
</style>