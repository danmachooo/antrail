export type ElementType = 'button' | 'input' | 'navigation' | 'link' | 'form' | 'table'

export interface TutorialStep {
  stepNumber: number
  title: string
  instruction: string
  uiElementHint: string
  elementType: ElementType
  suggestedSelector: string | null
  confirmedSelector: string | null
  confidence: number
}

export interface TutorialData {
  tutorialTitle: string
  appName: string
  extractedFrom: string
  totalSteps: number
  steps: TutorialStep[]
}

export const SAMPLE_MANUAL = `# Inventory Management System - User Manual

## Adding a New Inventory Item

This guide explains how to add a new product to the inventory tracking system.

### Prerequisites
- You must be logged in as an admin or inventory manager
- The item must have a valid SKU code

### Steps

1. Navigate to the Inventory section by clicking "Inventory" in the left sidebar navigation menu.

2. Locate and click the "Add Item" button, which appears in the top-right corner of the Inventory Items page.

3. In the item form that appears, fill in the Item Name field with the full product name.

4. Enter the unique SKU (Stock Keeping Unit) code in the SKU field. SKUs must be alphanumeric.

5. Set the initial stock quantity in the Quantity field. Enter a whole number greater than zero.

6. Click the Save button to confirm and add the item to the system. You will see the new item appear in the inventory table.

### Notes
- Items with quantity below 5 will be marked as Low Stock automatically.
- You can edit any item later by clicking its row in the table.`

export const MOCK_TUTORIAL: TutorialData = {
  tutorialTitle: 'Adding a New Inventory Item',
  appName: 'InvenTrack IMS',
  extractedFrom: 'inventory-manual.txt',
  totalSteps: 6,
  steps: [
    {
      stepNumber: 1,
      title: 'Navigate to Inventory',
      instruction: "Click on 'Inventory' in the left sidebar navigation menu to open the inventory section.",
      uiElementHint: 'Inventory sidebar menu item',
      elementType: 'navigation',
      suggestedSelector: '#sidebar-inventory',
      confirmedSelector: null,
      confidence: 0.95,
    },
    {
      stepNumber: 2,
      title: 'Click Add Item',
      instruction: "Locate and click the 'Add Item' button in the top-right corner of the page.",
      uiElementHint: 'Add Item button, top-right',
      elementType: 'button',
      suggestedSelector: '#ims-add-btn',
      confirmedSelector: null,
      confidence: 0.92,
    },
    {
      stepNumber: 3,
      title: 'Enter Item Name',
      instruction: 'Fill in the Item Name field with the full product name.',
      uiElementHint: 'Item Name input field',
      elementType: 'input',
      suggestedSelector: '#field-item-name',
      confirmedSelector: null,
      confidence: 0.88,
    },
    {
      stepNumber: 4,
      title: 'Enter SKU Code',
      instruction: 'Type the unique alphanumeric SKU code into the SKU field.',
      uiElementHint: 'SKU input field',
      elementType: 'input',
      suggestedSelector: '#field-sku',
      confirmedSelector: null,
      confidence: 0.9,
    },
    {
      stepNumber: 5,
      title: 'Set Quantity',
      instruction: 'Enter the initial stock quantity as a whole number greater than zero.',
      uiElementHint: 'Quantity input field',
      elementType: 'input',
      suggestedSelector: '#field-quantity',
      confirmedSelector: null,
      confidence: 0.87,
    },
    {
      stepNumber: 6,
      title: 'Save the Item',
      instruction: 'Click the Save button to confirm. The new item will appear in the inventory table.',
      uiElementHint: 'Save button',
      elementType: 'button',
      suggestedSelector: '#btn-save',
      confirmedSelector: null,
      confidence: 0.94,
    },
  ],
}

export const LOADING_MESSAGES = [
  'Sending to server (POST /api/extract)...',
  'Preprocessing and normalizing text...',
  'Calling GPT-4o with structured prompt...',
  'Extracting steps and UI element hints...',
  'Validating JSON schema output...',
  'Complete. Building step cards...',
]

export const IMS_ITEMS = [
  { name: 'Office Chair', sku: 'CHR-001', qty: 24, status: 'In Stock' },
  { name: 'Standing Desk', sku: 'DSK-002', qty: 8, status: 'In Stock' },
  { name: 'Monitor Stand', sku: 'MNT-003', qty: 3, status: 'Low Stock' },
  { name: 'Keyboard Tray', sku: 'KBD-004', qty: 15, status: 'In Stock' },
]
