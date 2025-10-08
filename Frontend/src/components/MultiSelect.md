# MultiSelect Component Documentation

## Tổng quan

MultiSelect là component Vue 3 có thể tái sử dụng cho việc chọn nhiều mục từ danh sách. Component hỗ trợ nhiều tính năng nâng cao và có thể tùy chỉnh linh hoạt.

## Cài đặt và Import

```vue
<script setup>
import MultiSelect from '@/components/MultiSelect.vue'
</script>
```

## Sử dụng cơ bản

```vue
<template>
  <MultiSelect
    v-model="selectedItems"
    :options="options"
    label="Chọn mục yêu thích"
    placeholder="Chọn các mục..."
  />
</template>

<script setup>
import { ref } from 'vue'
import MultiSelect from '@/components/MultiSelect.vue'

const selectedItems = ref([])
const options = [
  { id: 1, label: 'JavaScript' },
  { id: 2, label: 'Python' },
  { id: 3, label: 'Java' },
]
</script>
```

## Props API

### Dữ liệu (Data)

| Prop         | Type  | Default | Mô tả                  |
| ------------ | ----- | ------- | ---------------------- |
| `modelValue` | Array | `[]`    | Các mục đã được chọn   |
| `options`    | Array | `[]`    | Danh sách các tùy chọn |

### Cấu hình hiển thị (Display Configuration)

| Prop          | Type   | Default             | Mô tả              |
| ------------- | ------ | ------------------- | ------------------ |
| `label`       | String | `''`                | Nhãn cho component |
| `placeholder` | String | `'Chọn các mục...'` | Placeholder text   |

### Cấu hình item (Item Configuration)

| Prop           | Type            | Default   | Mô tả                          |
| -------------- | --------------- | --------- | ------------------------------ |
| `itemKey`      | String/Function | `'id'`    | Key để định danh mục           |
| `itemLabel`    | String/Function | `'label'` | Trường hiển thị tên mục        |
| `itemCount`    | String/Function | `null`    | Trường hiển thị số lượng       |
| `itemDisabled` | String/Function | `null`    | Trường xác định mục bị vô hiệu |

### Hành vi (Behavior)

| Prop                | Type    | Default         | Mô tả                      |
| ------------------- | ------- | --------------- | -------------------------- |
| `searchable`        | Boolean | `true`          | Cho phép tìm kiếm          |
| `searchPlaceholder` | String  | `'Tìm kiếm...'` | Placeholder cho ô tìm kiếm |
| `showSelectAll`     | Boolean | `true`          | Hiển thị nút "Chọn tất cả" |
| `selectAllText`     | String  | `'Chọn tất cả'` | Text cho nút chọn tất cả   |
| `closeOnSelect`     | Boolean | `false`         | Đóng dropdown khi chọn     |

### Giới hạn (Limits)

| Prop                 | Type   | Default   | Mô tả                           |
| -------------------- | ------ | --------- | ------------------------------- |
| `maxSelectedDisplay` | Number | `3`       | Số mục tối đa hiển thị          |
| `maxHeight`          | String | `'200px'` | Chiều cao tối đa dropdown       |
| `maxSelections`      | Number | `null`    | Số lượng mục tối đa có thể chọn |

### Trạng thái (States)

| Prop       | Type    | Default | Mô tả             |
| ---------- | ------- | ------- | ----------------- |
| `disabled` | Boolean | `false` | Vô hiệu component |

### Validation

| Prop         | Type   | Default | Mô tả          |
| ------------ | ------ | ------- | -------------- |
| `error`      | String | `''`    | Thông báo lỗi  |
| `helperText` | String | `''`    | Text hướng dẫn |

### Tùy chọn hiển thị (Display Options)

| Prop            | Type    | Default                    | Mô tả                     |
| --------------- | ------- | -------------------------- | ------------------------- |
| `showCount`     | Boolean | `false`                    | Hiển thị số lượng item    |
| `noResultsText` | String  | `'Không tìm thấy kết quả'` | Text khi không có kết quả |

## Events

| Event               | Payload | Mô tả                     |
| ------------------- | ------- | ------------------------- |
| `update:modelValue` | Array   | Emit khi giá trị thay đổi |
| `change`            | Array   | Emit khi có thay đổi      |
| `search`            | String  | Emit khi tìm kiếm         |
| `open`              | -       | Emit khi mở dropdown      |
| `close`             | -       | Emit khi đóng dropdown    |

## Ví dụ nâng cao

### 1. Custom Keys và Functions

```vue
<MultiSelect
  v-model="selectedUsers"
  :options="users"
  :item-key="(user) => user.email"
  :item-label="(user) => `${user.firstName} ${user.lastName}`"
  :item-disabled="(user) => user.status === 'inactive'"
  label="Chọn người dùng"
/>
```

### 2. Với số lượng và giới hạn

```vue
<MultiSelect
  v-model="selectedCourses"
  :options="courses"
  item-key="code"
  item-label="title"
  item-count="students"
  :show-count="true"
  :max-selections="3"
  label="Chọn khóa học"
  helper-text="Tối đa 3 khóa học"
/>
```

### 3. Không có tìm kiếm

```vue
<MultiSelect
  v-model="selectedSections"
  :options="sections"
  :searchable="false"
  :show-select-all="true"
  :close-on-select="false"
  label="Chọn phần thi"
/>
```

### 4. Với validation

```vue
<MultiSelect
  v-model="selectedTags"
  :options="tags"
  :error="tagError"
  label="Chọn thẻ"
  @change="validateTags"
/>
```

## CSS Customization

Component sử dụng scoped CSS và có thể tùy chỉnh thông qua CSS variables hoặc deep selectors:

```vue
<style>
.my-multiselect :deep(.multi-select-input) {
  border-radius: 1rem;
}

.my-multiselect :deep(.selected-tag) {
  background: linear-gradient(135deg, #f3e8ff, #fce7f3);
}
</style>
```

## Accessibility

- Hỗ trợ keyboard navigation (Enter, Space, Escape)
- ARIA attributes cho screen readers
- Focus management
- Tabindex hợp lý

## Performance

- Lazy rendering cho danh sách lớn
- Debounced search
- Virtual scrolling (có thể thêm trong tương lai)
- Memory efficient event handling

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE11+ (cần polyfills cho Vue 3)

## Troubleshooting

### Component không hiển thị options

- Kiểm tra `options` prop có đúng format không
- Đảm bảo `itemKey` và `itemLabel` tương ứng với cấu trúc data

### Selected items không hiển thị đúng

- Kiểm tra `v-model` binding
- Đảm bảo `itemKey` unique cho mỗi item

### Styling không đúng

- Sử dụng `:deep()` selector cho custom CSS
- Kiểm tra CSS specificity
