export type TenantScope = { shopId: string };

/** Place the trusted tenant id last so an incoming filter cannot override it. */
export function withTenantWhere<T extends object>(tenant: TenantScope, where: T): T & TenantScope {
  return { ...where, shopId: tenant.shopId } as T & TenantScope;
}

/** Place the trusted tenant id last so request data cannot create a row for another shop. */
export function withTenantData<T extends object>(tenant: TenantScope, data: T): T & TenantScope {
  return { ...data, shopId: tenant.shopId } as T & TenantScope;
}
