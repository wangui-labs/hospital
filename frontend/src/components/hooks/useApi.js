import { useState, useCallback, useRef, useEffect } from 'react';
import { activityAPI } from '../../services/api';

// ============================================================================
// USE API HOOK
// ============================================================================

export const useApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const abortControllerRef = useRef(null);

    // ============================================================================
    // REQUEST WRAPPER
    // ============================================================================

    const request = useCallback(async (apiCall, options = {}) => {
        const { showLoading = true, showError = true, onSuccess, onError } = options;

        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create new abort controller
        abortControllerRef.current = new AbortController();

        if (showLoading) setLoading(true);
        setError(null);

        try {
            const result = await apiCall();
            setData(result);
            if (onSuccess) onSuccess(result);
            return { success: true, data: result };
        } catch (err) {
            const errorMessage = err.message || 'Something went wrong';
            setError(errorMessage);
            if (showError) console.error('API Error:', errorMessage);
            if (onError) onError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            if (showLoading) setLoading(false);
            abortControllerRef.current = null;
        }
    }, []);

    // ============================================================================
    // SPECIFIC API CALLS
    // ============================================================================

    const get = useCallback(async (apiFunction, params = {}, options = {}) => {
        return request(() => apiFunction(params), options);
    }, [request]);

    const post = useCallback(async (apiFunction, data = {}, options = {}) => {
        return request(() => apiFunction(data), options);
    }, [request]);

    const put = useCallback(async (apiFunction, id, data = {}, options = {}) => {
        return request(() => apiFunction(id, data), options);
    }, [request]);

    const del = useCallback(async (apiFunction, id, options = {}) => {
        return request(() => apiFunction(id), options);
    }, [request]);

    // ============================================================================
    // RESET FUNCTIONS
    // ============================================================================

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // ============================================================================
    // CANCEL REQUEST
    // ============================================================================

    const cancel = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setLoading(false);
        }
    }, []);

    // ============================================================================
    // RETURN
    // ============================================================================

    return {
        // State
        loading,
        error,
        data,

        // Generic request
        request,

        // HTTP methods
        get,
        post,
        put,
        delete: del,

        // Utilities
        reset,
        clearError,
        cancel,

        // Helpers
        isLoading: loading,
        hasError: !!error,
        hasData: !!data,
    };
};

// ============================================================================
// USE FETCH HOOK (Simplified version for single API calls)
// ============================================================================

export const useFetch = (apiFunction, dependencies = [], options = {}) => {
    const { loading, error, data, request, reset } = useApi();
    const { autoFetch = true, onSuccess, onError } = options;

    const fetchData = useCallback(async () => {
        return request(() => apiFunction(), { onSuccess, onError });
    }, [apiFunction, request, onSuccess, onError]);

    useEffect(() => {
        if (autoFetch) {
            fetchData();
        }
        return () => reset();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies);

    return {
        loading,
        error,
        data,
        fetchData,
        reset,
    };
};

// ============================================================================
// USE MUTATION HOOK (For create/update/delete operations)
// ============================================================================

export const useMutation = (apiFunction, options = {}) => {
    const { loading, error, request, reset, clearError } = useApi();
    const { onSuccess, onError } = options;

    const mutate = useCallback(async (params = {}) => {
        return request(() => apiFunction(params), { onSuccess, onError });
    }, [apiFunction, request, onSuccess, onError]);

    return {
        loading,
        error,
        mutate,
        reset,
        clearError,
    };
};

// ============================================================================
// USE API CLIENT (Pre-configured for specific entities)
// ============================================================================

export const useApiClient = (crudAPI) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [list, setList] = useState([]);

    // GET ALL
    const getAll = useCallback(async (options = {}) => {
        setLoading(true);
        setError(null);
        try {
            const result = await crudAPI.getAll();
            setList(result[Object.keys(result)[0]] || result);
            if (options.onSuccess) options.onSuccess(result);
            return { success: true, data: result };
        } catch (err) {
            const msg = err.message || 'Failed to fetch data';
            setError(msg);
            if (options.onError) options.onError(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    }, [crudAPI]);

    // GET BY ID
    const getById = useCallback(async (id, options = {}) => {
        setLoading(true);
        setError(null);
        try {
            const result = await crudAPI.getById(id);
            setData(result);
            if (options.onSuccess) options.onSuccess(result);
            return { success: true, data: result };
        } catch (err) {
            const msg = err.message || 'Failed to fetch item';
            setError(msg);
            if (options.onError) options.onError(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    }, [crudAPI]);

    // CREATE
    const create = useCallback(async (item, options = {}) => {
        setLoading(true);
        setError(null);
        try {
            const result = await crudAPI.create(item);
            setList(prev => [...prev, result]);
            if (options.onSuccess) options.onSuccess(result);
            return { success: true, data: result };
        } catch (err) {
            const msg = err.message || 'Failed to create item';
            setError(msg);
            if (options.onError) options.onError(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    }, [crudAPI]);

    // UPDATE
    const update = useCallback(async (id, item, options = {}) => {
        setLoading(true);
        setError(null);
        try {
            const result = await crudAPI.update(id, item);
            setList(prev => prev.map(i => i.id === id ? result : i));
            if (options.onSuccess) options.onSuccess(result);
            return { success: true, data: result };
        } catch (err) {
            const msg = err.message || 'Failed to update item';
            setError(msg);
            if (options.onError) options.onError(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    }, [crudAPI]);

    // DELETE
    const deleteItem = useCallback(async (id, options = {}) => {
        setLoading(true);
        setError(null);
        try {
            await crudAPI.delete(id);
            setList(prev => prev.filter(i => i.id !== id));
            if (options.onSuccess) options.onSuccess(id);
            return { success: true };
        } catch (err) {
            const msg = err.message || 'Failed to delete item';
            setError(msg);
            if (options.onError) options.onError(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    }, [crudAPI]);

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
    }, []);

    return {
        loading,
        error,
        data,
        list,
        getAll,
        getById,
        create,
        update,
        delete: deleteItem,
        reset,
    };
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default useApi;