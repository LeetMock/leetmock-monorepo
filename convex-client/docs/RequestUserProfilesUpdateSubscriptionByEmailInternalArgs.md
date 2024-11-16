# RequestUserProfilesUpdateSubscriptionByEmailInternalArgs


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**current_period_end** | **float** |  | [optional] 
**current_period_start** | **float** |  | [optional] 
**email** | **str** |  | 
**interval** | [**RequestUserProfilesUpdateSubscriptionByEmailInternalArgsInterval**](RequestUserProfilesUpdateSubscriptionByEmailInternalArgsInterval.md) |  | [optional] 
**latest_subscription_id** | **str** |  | [optional] 
**minutes_remaining** | **float** |  | [optional] 
**plan_name** | [**RequestAdminsCreateUserProfileArgsSubscription**](RequestAdminsCreateUserProfileArgsSubscription.md) |  | [optional] 
**refresh_date** | **float** |  | [optional] 
**subscription_status** | **str** |  | [optional] 

## Example

```python
from convex_client.models.request_user_profiles_update_subscription_by_email_internal_args import RequestUserProfilesUpdateSubscriptionByEmailInternalArgs

# TODO update the JSON string below
json = "{}"
# create an instance of RequestUserProfilesUpdateSubscriptionByEmailInternalArgs from a JSON string
request_user_profiles_update_subscription_by_email_internal_args_instance = RequestUserProfilesUpdateSubscriptionByEmailInternalArgs.from_json(json)
# print the JSON string representation of the object
print(RequestUserProfilesUpdateSubscriptionByEmailInternalArgs.to_json())

# convert the object into a dict
request_user_profiles_update_subscription_by_email_internal_args_dict = request_user_profiles_update_subscription_by_email_internal_args_instance.to_dict()
# create an instance of RequestUserProfilesUpdateSubscriptionByEmailInternalArgs from a dict
request_user_profiles_update_subscription_by_email_internal_args_from_dict = RequestUserProfilesUpdateSubscriptionByEmailInternalArgs.from_dict(request_user_profiles_update_subscription_by_email_internal_args_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


