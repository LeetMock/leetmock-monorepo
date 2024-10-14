# RequestAdminsPatchUserSubscription


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**args** | [**RequestAdminsPatchUserSubscriptionArgs**](RequestAdminsPatchUserSubscriptionArgs.md) |  | 

## Example

```python
from convex_client.models.request_admins_patch_user_subscription import RequestAdminsPatchUserSubscription

# TODO update the JSON string below
json = "{}"
# create an instance of RequestAdminsPatchUserSubscription from a JSON string
request_admins_patch_user_subscription_instance = RequestAdminsPatchUserSubscription.from_json(json)
# print the JSON string representation of the object
print(RequestAdminsPatchUserSubscription.to_json())

# convert the object into a dict
request_admins_patch_user_subscription_dict = request_admins_patch_user_subscription_instance.to_dict()
# create an instance of RequestAdminsPatchUserSubscription from a dict
request_admins_patch_user_subscription_from_dict = RequestAdminsPatchUserSubscription.from_dict(request_admins_patch_user_subscription_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


