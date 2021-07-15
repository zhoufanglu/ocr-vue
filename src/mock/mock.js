import Mock from "mockjs";
const Random = Mock.Random;

import base from '@/request/api/base'

export const mockFn = (isOpen) => {
  if (!isOpen) return false
  //获取条款列表
  Mock.mock(`${base.dynamicUrl}/user/test`, {
    "list|3-10": [
      {
        id: () => Random.integer(1, 100),
        pId: () => Random.integer(1, 100),
        name: () => Random.ctitle(),
      },
    ],
  });
}
