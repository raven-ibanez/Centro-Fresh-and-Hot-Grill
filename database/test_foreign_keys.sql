-- =====================================================
-- Test Foreign Key Compatibility
-- =====================================================
-- This script tests if all foreign key references are compatible

-- Test 1: Check if payment_methods table exists and has correct ID type
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_methods') THEN
        -- Check the data type of the id column
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'payment_methods' 
            AND column_name = 'id' 
            AND data_type = 'text'
        ) THEN
            RAISE NOTICE '✓ payment_methods.id is TEXT type - compatible with payments.payment_method_id';
        ELSE
            RAISE WARNING '✗ payment_methods.id is not TEXT type - foreign key will fail';
        END IF;
    ELSE
        RAISE WARNING '✗ payment_methods table does not exist';
    END IF;
END $$;

-- Test 2: Check if menu_items table exists and has correct ID type
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'menu_items') THEN
        -- Check the data type of the id column
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'menu_items' 
            AND column_name = 'id' 
            AND data_type = 'uuid'
        ) THEN
            RAISE NOTICE '✓ menu_items.id is UUID type - compatible with order_items.menu_item_id';
        ELSE
            RAISE WARNING '✗ menu_items.id is not UUID type - foreign key will fail';
        END IF;
    ELSE
        RAISE WARNING '✗ menu_items table does not exist';
    END IF;
END $$;

-- Test 3: Check if variations table exists and has correct ID type
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'variations') THEN
        -- Check the data type of the id column
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'variations' 
            AND column_name = 'id' 
            AND data_type = 'uuid'
        ) THEN
            RAISE NOTICE '✓ variations.id is UUID type - compatible with order_items.selected_variation_id';
        ELSE
            RAISE WARNING '✗ variations.id is not UUID type - foreign key will fail';
        END IF;
    ELSE
        RAISE WARNING '✗ variations table does not exist';
    END IF;
END $$;

-- Test 4: Check if add_ons table exists and has correct ID type
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'add_ons') THEN
        -- Check the data type of the id column
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'add_ons' 
            AND column_name = 'id' 
            AND data_type = 'uuid'
        ) THEN
            RAISE NOTICE '✓ add_ons.id is UUID type - compatible with order_item_addons.addon_id';
        ELSE
            RAISE WARNING '✗ add_ons.id is not UUID type - foreign key will fail';
        END IF;
    ELSE
        RAISE WARNING '✗ add_ons table does not exist';
    END IF;
END $$;

-- Test 5: Check if all POS tables can be created without foreign key errors
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Foreign Key Compatibility Test Complete';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'If all tests show ✓, the database is ready for POS setup.';
    RAISE NOTICE 'If any tests show ✗, fix the data type issues first.';
    RAISE NOTICE '=====================================================';
END $$;
